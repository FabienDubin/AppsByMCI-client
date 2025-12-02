import { useEffect, useState, useRef } from "react";
import powerUpService from "@/services/powerup.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Camera,
  Upload,
  Download,
  Siren,
  Shield,
} from "lucide-react";

// THEME
import { useTheme } from "@/components/ThemeProvider";
import { Helmet } from "react-helmet-async";

// Loading messages (formal "vous" form)
const messages = [
  "Activation de vos super-pouvoirs...",
  "Calibrage de votre emblème...",
  "Tissage de votre cape...",
  "Analyse de votre profil héroïque...",
  "Synchronisation avec le multivers...",
  "Chargement de votre Power Up...",
  "Votre transformation est en cours...",
  "Les héros ne naissent pas, ils se révèlent...",
  "Révélation de votre potentiel caché...",
  "Préparation de votre entrée héroïque...",
];

const PowerUpProfile = () => {
  // STATES
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: "", gender: "Homme", email: "", code: "" });
  const [questions, setQuestions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [allowedDomains, setAllowedDomains] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [resultProfile, setResultProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");

  // Refs for camera
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Theme
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("dark");
  }, []);

  // Progress (4 questions + photo steps)
  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await powerUpService.getConfig();
        setQuestions(data.questions || []);
        setProfiles(data.profiles || []);
        setAllowedDomains(data.allowedDomains || []);
      } catch (e) {
        console.error("Erreur chargement config:", e);
      }
    };
    fetchConfig();
  }, []);

  // Random message while loading
  useEffect(() => {
    if (loading) {
      const int = setInterval(() => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setRandomMessage(msg);
      }, 2000);
      return () => clearInterval(int);
    }
  }, [loading]);

  // FUNCTIONS
  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[step - 1] = value;
    setAnswers(newAnswers);
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      // After Q4, go to photo selection
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step === 6 && isCameraActive) stopCamera();
    setStep((s) => s - 1);
  };

  // File select
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
      setStep(7);
    }
  };

  // Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (e) {
      console.error(e);
      alert("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL());
          stopCamera();
          setStep(7);
        },
        "image/jpeg",
        0.8
      );
    }
  };

  // Email validation
  const validateEmail = (email) => {
    const trimmed = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) return "Format d'email invalide";
    if (allowedDomains.length > 0) {
      const domain = trimmed.substring(trimmed.indexOf("@"));
      if (
        !allowedDomains
          .map((d) => d.trim().toLowerCase())
          .includes(domain.toLowerCase())
      ) {
        return "Domaine email non autorisé";
      }
    }
    return "";
  };

  // Generate avatar
  const handleGenerate = async () => {
    if (!selectedImage || !user.name || !user.email || !user.code || answers.length !== 4) {
      alert("Veuillez compléter toutes les étapes avant de générer.");
      return;
    }
    setLoading(true);
    setStep(8);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("name", user.name);
      formData.append("gender", user.gender);
      formData.append("email", user.email.trim());
      formData.append("code", user.code);
      formData.append("answers", JSON.stringify(answers));
      const res = await powerUpService.submitResponse(formData);
      setGeneratedImageUrl(res.generatedImageUrl);
      setResultProfile({
        name: res.profileName,
        pitch: res.profilePitch,
        id: res.profile,
      });
      if (res.emailError) {
        setAlertMessage({
          message: "Erreur d'envoi d'email : " + res.emailError,
        });
      } else if (!res.emailSent) {
        setAlertMessage({ message: "L'email n'a pas pu être envoyé." });
      } else {
        setAlertMessage(null);
      }
      setStep(9);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setCodeError("Code incorrect");
        setStep(0);
      } else {
        setAlertMessage(
          err.response?.data || { message: "Une erreur est survenue" }
        );
        setStep(7);
      }
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setUser({ name: "", gender: "Homme", email: "", code: "" });
    setAnswers([]);
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedImageUrl(null);
    setResultProfile(null);
    setStep(0);
    stopCamera();
    setAlertMessage(null);
    setEmailError("");
    setCodeError("");
  };

  // Cleanup
  useEffect(() => () => stopCamera(), []);

  // Background image URL
  const backgroundUrl = "https://storagemercedescla01.blob.core.windows.net/background/fond.png";

  // RENDER
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <Helmet>
        <title>AppsByMCI - Power Up!</title>
        <meta
          name="description"
          content="Découvrez votre profil de super-héros du quotidien"
        />
      </Helmet>

      <div className="relative z-10 max-w-xl mx-auto bg-black/70 rounded-xl px-6 py-8 text-center space-y-6 min-h-screen">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://storagemercedescla01.blob.core.windows.net/background/Logo.png"
              alt="Power Up!"
              className="h-16"
            />
          </div>
          <p className="text-gray-300">
            Révélez votre super-héros du quotidien
          </p>
        </div>

        {step < 8 && step > 0 && <Progress value={progress} className="mb-6" />}

        {alertMessage && (
          <Alert className="mb-6">
            <Siren className="h-4 w-4" />
            <AlertTitle>{alertMessage.message}</AlertTitle>
            <AlertDescription>
              <Button variant="secondary" className="mt-2" onClick={restart}>
                Recommencer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 0: User info */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Qui êtes-vous ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Votre prénom"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
              <div className="flex gap-4">
                {["Homme", "Femme", "Autre"].map((g) => (
                  <Button
                    key={g}
                    variant={user.gender === g ? "default" : "outline"}
                    onClick={() => setUser({ ...user, gender: g })}
                  >
                    {g}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Email professionnel"
                value={user.email}
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                  setEmailError("");
                }}
                onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                type="email"
                autoComplete="email"
              />
              {emailError && (
                <div className="text-red-500 text-sm">{emailError}</div>
              )}
              <Input
                placeholder="Code d'accès"
                value={user.code}
                onChange={(e) => {
                  setUser({ ...user, code: e.target.value });
                  setCodeError("");
                }}
                type="text"
              />
              {codeError && (
                <div className="text-red-500 text-sm">{codeError}</div>
              )}
              <Button
                className="w-full mt-4"
                onClick={() => {
                  const err = validateEmail(user.email);
                  setEmailError(err);
                  if (!user.name || err || !user.code) return;
                  setStep(1);
                }}
                disabled={
                  !user.name || !user.email || !user.code || !!validateEmail(user.email)
                }
              >
                Démarrer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Steps 1-4: Questions */}
        {step > 0 && step <= 4 && questions[step - 1] && (
          <Card>
            <CardHeader>
              <CardTitle>
                Question {step}/4 : {questions[step - 1].text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions[step - 1].options.map((opt) => (
                <Button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full text-left justify-start whitespace-normal min-h-[3.5rem]"
                  variant="outline"
                >
                  {opt.label}
                </Button>
              ))}
              <Button variant="ghost" onClick={handleBack} className="mt-4">
                ← Revenir
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Choose photo method */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Ajoutez votre photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full flex items-center gap-2"
                onClick={() => setStep(6)}
              >
                <Camera className="w-4 h-4" />
                Prendre un selfie
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Choisir une photo
              </Button>
              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>
              <p className="text-sm text-gray-300 mt-4">
                En soumettant votre photo, vous acceptez qu'elle soit traitée
                par une IA hébergée par un service tiers.{" "}
                <a
                  className="underline text-emerald-400 hover:text-emerald-300 italic"
                  href="https://openai.com/enterprise-privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  En savoir plus
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Camera */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Prenez votre photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-4">
                {!isCameraActive ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Démarrer la caméra
                  </Button>
                ) : (
                  <>
                    <Button onClick={takePhoto} className="flex-1">
                      Prendre la photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Arrêter
                    </Button>
                  </>
                )}
              </div>
              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>
              <p className="text-sm text-gray-300 mt-4">
                En soumettant votre photo, vous acceptez qu'elle soit traitée
                par une IA hébergée par un service tiers.{" "}
                <a
                  className="underline text-emerald-400 hover:text-emerald-300 italic"
                  href="https://openai.com/enterprise-privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  En savoir plus
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Preview */}
        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmez votre photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview && (
                <div className="text-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg shadow-md max-w-full max-h-64 mx-auto"
                  />
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedImage}
                  className="flex-1"
                >
                  Générer mon avatar
                </Button>
              </div>
              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>
              <p className="text-sm text-gray-300 mt-4">
                En soumettant votre photo, vous acceptez qu'elle soit traitée
                par une IA hébergée par un service tiers.{" "}
                <a
                  className="underline text-emerald-400 hover:text-emerald-300 italic"
                  href="https://openai.com/enterprise-privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  En savoir plus
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 8: Loading */}
        {step === 8 && (
          <div className="rounded-xl px-6 py-8 text-center space-y-6">
            <Loader2 className="mx-auto animate-spin h-20 w-20 text-emerald-400" />
            <p className="text-lg text-white">{randomMessage}</p>
            <p className="text-gray-300">Génération en cours...</p>
          </div>
        )}

        {/* Step 9: Result */}
        {step === 9 && generatedImageUrl && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex flex-col items-center justify-center gap-2">
                  <img
                    src="https://storagemercedescla01.blob.core.windows.net/background/Logo.png"
                    alt="Power Up!"
                    className="h-10"
                  />
                  <span>Votre Avatar Power Up</span>
                  {resultProfile && (
                    <span className="text-emerald-400 text-lg font-bold">
                      {resultProfile.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resultProfile && (
                  <p className="text-gray-300 text-sm italic mb-4">
                    {resultProfile.pitch}
                  </p>
                )}
                <div className="text-center">
                  <img
                    src={generatedImageUrl}
                    alt="Avatar Power Up"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div className="flex gap-4 justify-center mt-6">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        generatedImageUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={restart}
                  >
                    Recommencer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PowerUpProfile;
