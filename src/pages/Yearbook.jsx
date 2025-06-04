import { useEffect, useState, useRef } from "react";
import yearbookService from "@/services/yearbook.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Camera, Upload, Download, Siren } from "lucide-react";

//THEME
import { useTheme } from "@/components/ThemeProvider";

//Messages array to be displayed while generating the yearbook image
const messages = [
  "Préparation de votre photo yearbook...",
  "Analyse du style rétro années 80-90...",
  "Application des filtres nostalgiques...",
  "Création de l'ambiance prom night...",
  "Finalisation de votre portrait yearbook...",
];

const Yearbook = () => {
  //STATES
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: "", gender: "Homme", code: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState("");
  const [config, setConfig] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // // Set the dark theme by default for this page
  // const { setTheme } = useTheme();
  // useEffect(() => {
  //   setTheme("dark");
  // }, []);

  //PROGRESS BAR
  const progress = (step / 4) * 100; // 0 à 3 = étapes, 4 = loading, 5 = result

  //HOOKS
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await yearbookService.getConfig();
        setConfig(data);
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
          setStep(3); // Passer automatiquement à l'étape de prévisualisation
        },
        "image/jpeg",
        0.8
      );
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step === 0) return;
    if (step === 2 && isCameraActive) {
      stopCamera();
    }
    setStep((s) => s - 1);
  };

  // Handle generate button
  const handleGenerate = async () => {
    if (!selectedImage || !user.name || !user.code) {
      alert("Veuillez remplir tous les champs et sélectionner une image");
      return;
    }

    setLoading(true);
    setStep(4);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("name", user.name);
      formData.append("gender", user.gender);
      formData.append("code", user.code);

      const res = await yearbookService.submitPhoto(formData);
      setOriginalImageUrl(res.originalImageUrl);
      setGeneratedImageUrl(res.generatedImageUrl);
      setStep(5);
    } catch (err) {
      console.error(err);
      setAlertMessage(err.response.data);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Handle restart
  const restart = () => {
    setUser({ name: "", gender: "Homme", code: "" });
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
    <div className="bg-[url(https://storagemercedescla01.blob.core.windows.net/background/shutterstock_2501601971.jpg)] min-h-screen">
      <div className="z-10 max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Yearbook</h1>
          <p className="text-gray-400">Créez votre photo de promo rétro</p>
        </div>
        {step < 4 && <Progress value={progress} />}
        {alertMessage && (
          <Alert>
            <AlertTitle className="flex items-end">
              <Siren /> {alertMessage.message}
            </AlertTitle>
            <AlertDescription></AlertDescription>
            <Button variant="secondary" className="mt-2" onClick={restart}>
              Recommencer
            </Button>
          </Alert>
        )}
        <div>
          {/* Step 0: User info */}
          {step === 0 && (
            <Card className="h-2/3">
              <CardHeader>
                <CardTitle>Qui êtes-vous ?</CardTitle>
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
                  placeholder="Code d'accès"
                  value={user.code}
                  onChange={(e) => setUser({ ...user, code: e.target.value })}
                />
                <Button
                  className="w-full mt-4"
                  onClick={() => setStep(1)}
                  disabled={!user.name || !user.code}
                >
                  Continuer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Choose photo method */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Ajoutez une photo pour votre yearbook ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full flex items-center gap-2"
                  onClick={() => setStep(2)}
                >
                  <Camera className="w-4 h-4" />
                  Prendre un selfie
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    setStep(3);
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

          {/* Step 2: Camera */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Prenez votre selfie</CardTitle>
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

          {/* Step 3: Preview and confirm */}
          {step === 3 && (
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
                    Générer mon yearbook
                  </Button>
                </div>

                <Button variant="ghost" onClick={handleBack}>
                  ← Revenir
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Loading */}
          {step === 4 && (
            <div className="text-center space-y-6 py-12">
              <Loader2 className="mx-auto animate-spin h-20 w-20 text-gray-600" />
              <p className="text-lg text-white">{randomMessage}</p>
              <p className="text-muted-foreground">Génération en cours...</p>
            </div>
          )}

          {/* Step 5: Result */}
          {step === 5 && originalImageUrl && generatedImageUrl && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Votre transformation yearbook
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Photo originale
                    </p>
                    <img
                      src={originalImageUrl}
                      alt="Photo originale"
                      className="rounded-lg shadow-md w-full"
                    />
                  </div> */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Style yearbook
                    </p>
                    <img
                      src={generatedImageUrl}
                      alt="Photo yearbook"
                      className="rounded-lg shadow-md w-full"
                    />
                  </div>
                  {/* </div> */}

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
                      Recommencer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

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

export default Yearbook;
