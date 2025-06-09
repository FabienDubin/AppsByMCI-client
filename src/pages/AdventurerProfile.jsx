import { useEffect, useState, useRef } from "react";
import adventurerService from "@/services/adventurer.service";
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
  Compass,
  Siren,
} from "lucide-react";

//THEME
import { useTheme } from "@/components/ThemeProvider";
import { Helmet } from "react-helmet";

//Messages array to be displayed while generating the avatar
const messages = [
  "Exploration de votre profil d'aventurier...",
  "Analyse de votre esprit d'aventure...",
  "Préparation de l'équipement d'exploration...",
  "Cartographie de votre personnalité...",
  "Création de votre avatar d'aventurier...",
  "Chargement des terres inexplorées...",
  "Ajustement de votre boussole intérieure 🧭...",
  "Préparation du sac à dos d'aventure 🎒...",
  "Analyse des sentiers de montagne 🏔️...",
  "Fusion avec l'esprit de la nature 🌲...",
  "Calibrage de votre sens de l'orientation...",
  "Inscription dans le livre des explorateurs 📖...",
  "Lecture des carnets de voyage de Marco Polo...",
  "Chargement du journal de bord du Capitaine Nemo ⚓...",
  "Analyse des archives de Lara Croft 🗺️...",
  "Connexion à l'esprit d'Indiana Jones 🏺...",
  "Réveil de l'instinct de survie façon Bear Grylls...",
  "Exploration des étoiles avec l'équipage de Starfleet 🚀...",
  "Alignement sur la sagesse de Sir Ernest Shackleton...",
  "Chargement des récits de Phileas Fogg autour du monde 🌍...",
  "Synchronisation avec l'audace d'Amelia Earhart ✈️...",
  "Préparation du packatage de Dora 🎒...",
];

const AdventurerProfile = () => {
  //STATES
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: "", gender: "Homme", code: "" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);

  // Refs for camera functionality
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Set the dark theme by default for this page
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("dark");
  }, []);

  //PROGRESS BAR OF THE QUIZ
  const progress = (step / 9) * 100; // 0 à 8 = étapes, 9 = loading, 10 = result

  //HOOKS
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await adventurerService.getConfig();
        setQuestions(data.questions);
      } catch (error) {
        console.error("Erreur lors du chargement de la config:", error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        const random = messages[Math.floor(Math.random() * messages.length)];
        setRandomMessage(random);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  //FUNCTIONS
  //Handles the answer of the user
  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[step - 1] = value;
    setAnswers(newAnswers);
    if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  //Handles the back button
  const handleBack = () => {
    if (step === 0) return;
    if (step === 7 && isCameraActive) {
      stopCamera();
    }
    setStep((s) => s - 1);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setStep(8); // Go to preview step
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error);
      alert("Impossible d'accéder à la caméra");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Take photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL());
          stopCamera();
          setStep(8); // Go to preview step
        },
        "image/jpeg",
        0.8
      );
    }
  };

  //Handles the generate button
  const handleGenerate = async () => {
    if (!selectedImage || !user.name || !user.code || answers.length !== 5) {
      alert(
        "Veuillez remplir tous les champs, répondre aux questions et sélectionner une image"
      );
      return;
    }

    setLoading(true);
    setStep(9);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("name", user.name);
      formData.append("gender", user.gender);
      formData.append("code", user.code);
      formData.append("answers", JSON.stringify(answers));

      const res = await adventurerService.submitResponse(formData);
      setOriginalImageUrl(res.originalImageUrl);
      setGeneratedImageUrl(res.generatedImageUrl);
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

  //Handles the restart button
  const restart = () => {
    setUser({ name: "", gender: "Homme", code: "" });
    setAnswers([]);
    setSelectedImage(null);
    setImagePreview(null);
    setOriginalImageUrl(null);
    setGeneratedImageUrl(null);
    setStep(0);
    stopCamera();
    setAlertMessage(null);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className=" from-green-900 via-emerald-800 to-teal-900 bg-[url(https://storagemercedescla01.blob.core.windows.net/background/adventurerBG.png)] bg-cover bg-center min-h-screen">
      <Helmet>
        <title>AppsByMCI - Profil Aventurier</title>
        <meta
          name="description"
          content="Découvrez quel aventurier vous êtes."
        />
      </Helmet>
      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Compass className="w-12 h-12 text-amber-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">
              Profil d'Aventurier
            </h1>
          </div>
          <p className="text-gray-300">
            Découvrez votre avatar d'explorateur personnalisé
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

        {/* Step 0: User info */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Compass className="w-5 h-5 mr-2" />
                Qui êtes-vous, aventurier ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Votre prénom d'aventurier"
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
                placeholder="Code d'accès à l'expédition"
                value={user.code}
                onChange={(e) => setUser({ ...user, code: e.target.value })}
              />
              <Button
                className="w-full mt-4"
                onClick={() => setStep(1)}
                disabled={!user.name || !user.code}
              >
                Commencer l'aventure
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Steps 1-5: Questions */}
        {step > 0 && step <= 5 && questions[step - 1] && (
          <Card>
            <CardHeader>
              <CardTitle>
                Question {step}/5: {questions[step - 1].text}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
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

              {/* Si c'est la dernière question, passer à la photo */}
              {step === 5 && answers[4] && (
                <Button className="mt-4 w-full" onClick={() => setStep(6)}>
                  Continuer vers la photo
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 6: Choose photo method */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Ajoutez votre photo d'aventurier
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
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4" />
                Choisir une photo existante
              </Button>
              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Camera */}
        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle>Prenez votre photo d'aventurier</CardTitle>
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
            </CardContent>
          </Card>
        )}

        {/* Step 8: Preview and confirm */}
        {step === 8 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmez votre photo d'aventurier</CardTitle>
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
                  Générer mon avatar d'aventurier
                </Button>
              </div>

              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>
              <p className="text-sm text-gray-300 mt-4">
                En soumettant votre photo, vous acceptez qu'elle soit traitée
                par une intelligence artificielle hébergée par un service tiers.{" "}
                <a
                  className="underline text-amber-400 hover:text-amber-300 italic"
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

        {/* Step 9: Loading */}
        {step === 9 && (
          <div className="text-center space-y-6 py-12">
            <Loader2 className="mx-auto animate-spin h-20 w-20 text-amber-400" />
            <p className="text-lg text-white">{randomMessage}</p>
            <p className="text-gray-300">Génération en cours...</p>
          </div>
        )}

        {/* Step 10: Result */}
        {step === 10 && generatedImageUrl && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                  <Compass className="w-6 h-6 mr-2" />
                  Votre avatar d'aventurier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Votre profil d'explorateur
                  </p>
                  <img
                    src={generatedImageUrl}
                    alt="Avatar d'aventurier"
                    className="rounded-lg shadow-md w-full"
                  />
                </div>

                <div className="flex gap-4 justify-center mt-6">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      window.open(
                        generatedImageUrl,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={restart}
                  >
                    Nouvelle aventure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hidden file input */}
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

export default AdventurerProfile;
