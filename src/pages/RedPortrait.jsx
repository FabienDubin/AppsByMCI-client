import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import redPortraitService from "@/services/redportrait.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Upload,
  Download,
  Loader2,
  X,
  RefreshCw,
  Check,
  Mail,
  Palette,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Helmet } from "react-helmet-async";

const loadingMessages = [
  "Analyse de votre portrait...",
  "Application de la palette rouge et noir...",
  "Création de votre œuvre d'art...",
  "Ajout de contraste dramatique...",
  "Finalisation des détails...",
  "Optimisation des couleurs...",
  "Génération en cours...",
];

const RedPortrait = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accessCode: "",
    name: "",
    email: "",
  });
  const [config, setConfig] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("user");

  useEffect(() => {
    setTheme("dark");
    fetchConfig();
  }, [setTheme]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        const randomMessage =
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        setLoadingMessage(randomMessage);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const fetchConfig = async () => {
    try {
      const data = await redPortraitService.getConfig();
      setConfig(data);
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    }
  };

  const handleValidateCode = async () => {
    setError("");

    if (!formData.accessCode || !formData.name || !formData.email) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Email invalide");
      return;
    }

    try {
      await redPortraitService.validateCode(formData.accessCode);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.error || "Code invalide");
    }
  };

  const startCamera = async (mode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode || facingMode },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Erreur caméra:", error);
      setError("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    stopCamera();
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    setTimeout(() => startCamera(newMode), 100);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      if (facingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL("image/jpeg"));
          stopCamera();
          setStep(4); // Go to preview step
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setStep(4); // Go to preview step
      };
      reader.readAsDataURL(file);
      if (isCameraActive) stopCamera();
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Veuillez prendre ou sélectionner une photo");
      return;
    }

    setLoading(true);
    setError("");
    setLoadingMessage(loadingMessages[0]);

    const formDataToSend = new FormData();
    formDataToSend.append("accessCode", formData.accessCode);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("image", selectedImage);

    try {
      const response = await redPortraitService.submitPortrait(formDataToSend);
      setGeneratedImage(response.data.generatedImageUrl);
      setEmailSent(true);
      setStep(5);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error.response?.data?.error ||
          "Erreur lors de la génération du portrait"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `portrait-rouge-noir-${formData.name}.jpg`;
      link.target = "_blank";
      link.click();
    }
  };

  const handleRestart = () => {
    setStep(1);
    setFormData({ accessCode: "", name: "", email: "" });
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedImage(null);
    setError("");
    setEmailSent(false);
    stopCamera();
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step === 3 && isCameraActive) stopCamera();
    setStep((s) => s - 1);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-950">
      <Helmet>
        <title>Clarins - Transformation artistique</title>
        <meta
          name="description"
          content="Transformez votre portrait en œuvre d'art rouge et noir"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">Clarins</h1>
            <p className="text-gray-300">
              Transformez votre selfie en œuvre d'art rouge et noir
            </p>
          </div>

          {/* Étape 1 : Formulaire */}
          {step === 1 && (
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">
                  <Palette className="inline mr-2" />
                  Accès à l'expérience
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Entrez vos informations pour commencer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="code" className="text-gray-300">
                    Code d'accès
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Entrez le code"
                    value={formData.accessCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accessCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Votre nom
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Marie"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Votre email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="marie@clarins.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {error && (
                  <Alert className="bg-red-950 border-red-500">
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleValidateCode}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Continuer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Étape 2 : Choix de la méthode photo */}
          {step === 2 && (
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">
                  <Camera className="inline mr-2" />
                  Ajoutez votre photo
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Choisissez comment capturer votre portrait
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setStep(3)}
                  className="w-full bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Prendre un selfie
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-950 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choisir une photo
                </Button>
                <Button variant="ghost" onClick={handleBack} className="w-full">
                  ← Revenir
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Étape 3 : Caméra */}
          {step === 3 && (
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">
                  Prenez votre photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                    style={{
                      transform: facingMode === "user" ? "scaleX(-1)" : "none",
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-4">
                  {!isCameraActive ? (
                    <Button
                      onClick={startCamera}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Démarrer la caméra
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={takePhoto}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Prendre la photo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        className="border-red-500 text-red-400"
                      >
                        Arrêter
                      </Button>
                    </>
                  )}
                </div>

                <Button variant="ghost" onClick={handleBack} className="w-full">
                  ← Revenir
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Étape 4 : Preview et confirmation */}
          {step === 4 && (
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">
                  Confirmez votre photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview && (
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg shadow-md w-full"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedImage || loading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      "Générer mon portrait"
                    )}
                  </Button>
                </div>

                <Button variant="ghost" onClick={handleBack} className="w-full">
                  ← Revenir
                </Button>

                {loading && (
                  <Alert className="bg-gray-800 border-red-500">
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    <AlertDescription className="text-red-300 ml-2">
                      {loadingMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="bg-red-950 border-red-500">
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Étape 5 : Résultat */}
          {step === 5 && generatedImage && (
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">
                  <Palette className="inline mr-2" />
                  Votre portrait Rouge & Noir
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Votre transformation artistique est prête !
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Portrait Rouge & Noir"
                  className="w-full rounded-lg shadow-2xl"
                />

                {emailSent && (
                  <Alert className="bg-green-950 border-green-500">
                    <Mail className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-300 ml-2">
                      Votre portrait a été envoyé à {formData.email}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Download className="mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-400 hover:bg-red-950"
                  >
                    <RefreshCw className="mr-2" />
                    Nouveau portrait
                  </Button>
                </div>

                <Button
                  onClick={() => navigate("/redportrait/screen")}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-red-400"
                >
                  Voir la galerie →
                </Button>
              </CardContent>
            </Card>
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
    </div>
  );
};

export default RedPortrait;
