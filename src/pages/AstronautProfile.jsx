import { useEffect, useState, useRef } from "react";
import astronautService from "@/services/astronaut.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Camera, Upload, Download, Rocket, Siren } from "lucide-react";

//THEME
import { useTheme } from "@/components/ThemeProvider";
import { Helmet } from "react-helmet-async";

//Messages array to be displayed while generating the avatar
const messages = [
  "Exploration de votre profil d'astronaute...",
  "Analyse de votre esprit spatial...",
  "Préparation de l'équipement spatial...",
  "Cartographie de votre personnalité cosmique...",
  "Création de votre avatar d'astronaute...",
  "Chargement des coordonnées galactiques...",
  "Ajustement de votre navigation stellaire 🚀...",
  "Préparation de la combinaison spatiale 👨‍🚀...",
  "Analyse des trajectoires orbitales 🛰️...",
  "Fusion avec l'esprit de l'espace 🌌...",
  "Calibrage de votre système de navigation...",
  "Inscription dans le registre des astronautes 📋...",
  "Lecture des journaux de bord de Neil Armstrong...",
  "Chargement des données de la Station Spatiale Internationale 🛸...",
  "Analyse des archives de la NASA 🌍...",
  "Connexion à l'esprit de Yuri Gagarin 🚀...",
  "Réveil de l'instinct d'exploration spatiale...",
  "Exploration des galaxies lointaines avec Hubble 🔭...",
  "Alignement sur la sagesse de Mae Jemison...",
  "Chargement des cartes stellaires de l'univers 🌟...",
  "Synchronisation avec l'audace de Valentina Tereshkova 👩‍🚀...",
  "Préparation du module de commande spatial 🛰️...",
];

const AstronautProfile = () => {
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
        const data = await astronautService.getConfig();
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

      const res = await astronautService.submitResponse(formData);
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
    <div className="from-blue-900 via-indigo-900 to-black bg-[url(https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80)] bg-cover bg-center min-h-screen">
      <Helmet>
        <title>AppsByMCI - Profil Astronaute</title>
        <meta
          name="description"
          content="Découvrez quel astronaute vous êtes."
        />
      </Helmet>
      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-white">
              Profil d'Astronaute
            </h1>
          </div>
          <p className="text-gray-300">
            Découvrez votre avatar d'explorateur spatial personnalisé
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
                <Rocket className="w-5 h-5 mr-2" />
                Qui êtes-vous, astronaute ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Votre nom d'astronaute"
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
                placeholder="Code d'accès à la mission spatiale"
                value={user.code}
                onChange={(e) => setUser({ ...user, code: e.target.value })}
              />
              <Button
                className="w-full mt-4"
                onClick={() => setStep(1)}
                disabled={!user.name || !user.code}
              >
                Commencer la mission
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
                Ajoutez votre photo d'astronaute
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full flex items-center gap-2"
                onClick={() => setStep(7)}
              >
                <Camera className="w-4 h-4" />
                Prendre un selfie spatial
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
              <CardTitle>Prenez votre photo d'astronaute</CardTitle>
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
              <CardTitle>Confirmez votre photo d'astronaute</CardTitle>
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
                  Générer mon avatar d'astronaute
                </Button>
              </div>

              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>
              <p className="text-sm text-gray-300 mt-4">
                En soumettant votre photo, vous acceptez qu'elle soit traitée
                par une intelligence artificielle hébergée par un service tiers.{" "}
                <a
                  className="underline text-blue-400 hover:text-blue-300 italic"
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
            <Loader2 className="mx-auto animate-spin h-20 w-20 text-blue-400" />
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
                  <Rocket className="w-6 h-6 mr-2" />
                  Votre avatar d'astronaute
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Votre profil d'explorateur spatial
                  </p>
                  <img
                    src={generatedImageUrl}
                    alt="Avatar d'astronaute"
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
                    Nouvelle mission
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

export default AstronautProfile;
