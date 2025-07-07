import { useEffect, useState, useRef } from "react";
import eventManagerService from "@/services/eventmanager.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  Camera,
  Upload,
  Download,
  PartyPopper,
  Siren,
} from "lucide-react";

// THEME
import { useTheme } from "@/components/ThemeProvider";
import { Helmet } from "react-helmet-async";

// Messages displayed while generating avatar
const messages = [
  "Préparation de votre événement grandiose...",
  "Réservation des lieux prestigieux...",
  "Connexion au cerveau d'Arnaud Chouraki",
  "Connexion à l'historique Sharepoint 😵",
  "Commande Haribo en cours",
  "Relecture du roadbook",
  "Synchronisation des talkies-walkies...",
  "Briefing des équipes logistiques...",
  "Création de votre avatar de chef·fe de projet...",
  "Calibration des lumières et du son...",
  "Mise en place du traiteur gastronomique...",
  "Vérification du plan des salles...",
  "Réglage des micros et projecteurs...",
  "Finalisation du planning minute par minute...",
];

const EventManagerProfile = () => {
  // STATES
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: "", gender: "Homme", email: "" });
  const [questions, setQuestions] = useState([]);
  const [allowedDomains, setAllowedDomains] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [emailError, setEmailError] = useState("");

  // Slider temp value
  const [sliderValue, setSliderValue] = useState(2);

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

  // Progress
  const progress = (step / 9) * 100;

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await eventManagerService.getConfig();
        setQuestions(data.questions);
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
    setSliderValue(2);
    if (step < 5) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step === 7 && isCameraActive) stopCamera();
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
      setStep(8);
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
          setStep(8);
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
    const domain = trimmed.substring(trimmed.indexOf("@"));
    if (
      !allowedDomains
        .map((d) => d.trim().toLowerCase())
        .includes(domain.toLowerCase())
    ) {
      return "Domaine email non autorisé";
    }
    return "";
  };

  // Generate avatar
  const handleGenerate = async () => {
    if (!selectedImage || !user.name || !user.email || answers.length !== 5) {
      alert("Veuillez compléter toutes les étapes avant de générer.");
      return;
    }
    setLoading(true);
    setStep(9);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("name", user.name);
      formData.append("gender", user.gender);
      formData.append("email", user.email.trim());
      formData.append("answers", JSON.stringify(answers));
      const res = await eventManagerService.submitResponse(formData);
      setOriginalImageUrl(res.originalImageUrl);
      setGeneratedImageUrl(res.generatedImageUrl);
      if (res.emailError) {
        setAlertMessage({
          message: "Erreur d'envoi d'email : " + res.emailError,
        });
      } else if (!res.emailSent) {
        setAlertMessage({ message: "L'email n'a pas pu être envoyé." });
      } else {
        setAlertMessage(null);
      }
      setStep(10);
    } catch (err) {
      console.error(err);
      setAlertMessage(
        err.response?.data || { message: "Une erreur est survenue" }
      );
      setStep(8);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setUser({ name: "", gender: "Homme", email: "" });
    setAnswers([]);
    setSelectedImage(null);
    setImagePreview(null);
    setOriginalImageUrl(null);
    setGeneratedImageUrl(null);
    setStep(0);
    stopCamera();
    setAlertMessage(null);
    setEmailError("");
  };

  // Cleanup
  useEffect(() => () => stopCamera(), []);

  // RENDER
  return (
    <div className="from-fuchsia-900 via-purple-900 to-black bg-[url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2070&q=80)] bg-cover bg-center min-h-screen">
      <Helmet>
        <title>AppsByMCI - Profil Event Manager</title>
        <meta
          name="description"
          content="Découvrez votre profil d'event manager"
        />
      </Helmet>

      <div className="relative z-10 max-w-xl mx-auto bg-black/70 rounded-xl px-6 py-8 text-center space-y-6 h-screen ">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <PartyPopper className="w-12 h-12 text-pink-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">
              Profil Event Manager
            </h1>
          </div>
          <p className="text-gray-300">
            Créez votre avatar de chef·fe de projet événementiel
          </p>
        </div>

        {step < 9 && <Progress value={progress} className="mb-6" />}

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

        {/* Step 0 : infos user */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PartyPopper className="w-5 h-5 mr-2" />
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
              <Button
                className="w-full mt-4"
                onClick={() => {
                  const err = validateEmail(user.email);
                  setEmailError(err);
                  if (!user.name || err) return;
                  setStep(1);
                }}
                disabled={
                  !user.name || !user.email || !!validateEmail(user.email)
                }
              >
                Démarrer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Steps 1-5 questions */}
        {step > 0 && step <= 5 && questions[step - 1] && (
          <Card>
            <CardHeader>
              <CardTitle>
                Question {step}/5&nbsp;: {questions[step - 1].text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions[step - 1].type === "choice" ? (
                questions[step - 1].options.map((opt) => (
                  <Button
                    key={opt.prompt_value}
                    onClick={() => handleAnswer(opt.prompt_value)}
                    className="w-full text-left justify-start whitespace-normal min-h-[3.5rem]"
                    variant="outline"
                  >
                    {opt.label}
                  </Button>
                ))
              ) : (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground px-1">
                    <span>{questions[step - 1].options[0].label}</span>
                    <span>{questions[step - 1].options[1].label}</span>
                  </div>
                  <Slider
                    min={0}
                    max={4}
                    step={1}
                    value={[sliderValue]}
                    onValueChange={(val) => setSliderValue(val[0])}
                  />
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleAnswer(sliderValue)}
                  >
                    Valider
                  </Button>
                </>
              )}

              <Button variant="ghost" onClick={handleBack} className="mt-4">
                ← Revenir
              </Button>

              {step === 5 && answers[4] && (
                <Button className="mt-4 w-full" onClick={() => setStep(6)}>
                  Continuer vers la photo
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 6 choose photo */}
        {step === 6 && (
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
                onClick={() => setStep(7)}
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
                  className="underline text-pink-400 hover:text-pink-300 italic"
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

        {/* Step 7 camera */}
        {step === 7 && (
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
                  className="underline text-pink-400 hover:text-pink-300 italic"
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

        {/* Step 8 preview */}
        {step === 8 && (
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
                  className="underline text-pink-400 hover:text-pink-300 italic"
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

        {/* Step 9 loading */}
        {step === 9 && (
          <div className=" rounded-xl px-6 py-8 text-center space-y-6">
            {/* <div className="bg-black/70 rounded-xl px-6 py-8 text-center space-y-6"> */}
            <Loader2 className="mx-auto animate-spin h-20 w-20 text-pink-400" />
            <p className="text-lg text-white">{randomMessage}</p>
            <p className="text-gray-300">Génération en cours...</p>
          </div>
        )}

        {/* Step 10 result */}
        {step === 10 && generatedImageUrl && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                  <PartyPopper className="w-6 h-6 mr-2" />
                  Votre avatar Event Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <img
                    src={generatedImageUrl}
                    alt="Avatar"
                    className="rounded-lg shadow-md w-full"
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

export default EventManagerProfile;
