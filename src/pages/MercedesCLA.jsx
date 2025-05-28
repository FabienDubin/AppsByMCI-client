import { useEffect, useState } from "react";
import claService from "@/services/cla.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import HeaderCla from "@/components/HeaderCla";

//THEME
import { useTheme } from "@/components/ThemeProvider";

//Messages array to be displayed while generating the avatar
const messages = [
  "Connexion au showroom Mercedes...",
  "Analyse de votre profil clubbing...",
  "Préparation des spots et de la lumière...",
  "Chargement du style CLA...",
  "Fusion de la techno et du design...",
];

const MercedesCLA = () => {
  //STATES
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: "", gender: "Homme", code: "" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState("");

  // //Set the dark theme by default for this page
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("dark");
  }, []);
  //PROGRESS BAR OF THE QUIZ
  const progress = (step / 6) * 100; // 0 à 5 = étapes, 6 = loading, 7 = image

  //HOOKS
  useEffect(() => {
    const fetchConfig = async () => {
      const data = await claService.getConfig();
      setQuestions(data.questions);
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
    setStep((s) => s - 1);
  };

  //hanfles the generate button
  const handleGenerate = async () => {
    setLoading(true);
    setStep(6);
    try {
      const res = await claService.submitAnswer({
        ...user,
        answers,
      });
      setImageUrl(res.imageUrl);
      setStep(7);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //Handles the restart button
  const restart = () => {
    setUser({ name: "", gender: "Homme", code: "" });
    setAnswers([]);
    setImageUrl(null);
    setStep(0);
  };

  return (
    <div className="bg-black min-h-screen">
      <HeaderCla />

      <div className="relative z-10 max-w-xl mx-auto px-4 mt-2 sm:mt-[-100px] md:mt-[-150px] lg:mt-[-200px] xl:mt-[-250px] 2xl:mt-[-300px] pb-8 space-y-6 shadow-xl">
        {step < 6 && <Progress value={progress} />}

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Qui êtes-vous ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Prénom"
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
                placeholder="Code d’accès"
                value={user.code}
                onChange={(e) => setUser({ ...user, code: e.target.value })}
              />
              <Button
                className="w-full mt-4"
                onClick={() => setStep(1)}
                disabled={!user.name || !user.code}
              >
                Commencer
              </Button>
            </CardContent>
          </Card>
        )}

        {step > 0 && step <= 5 && questions[step - 1] && (
          <Card>
            <CardHeader>
              <CardTitle>{questions[step - 1].text}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {questions[step - 1].options.map((opt) => (
                <Button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full"
                >
                  {opt.label}
                </Button>
              ))}

              <Button variant="ghost" onClick={handleBack}>
                ← Revenir
              </Button>

              {/* Si c’est la dernière question, affiche le bouton générer */}
              {step === 5 && answers[4] && (
                <Button className="mt-4 w-full" onClick={handleGenerate}>
                  Générer mon avatar
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === 6 && (
          <div className="text-center space-y-6 py-12">
            <Loader2 className="mx-auto animate-spin h-20 w-20 text-gray-600" />
            <p className="text-lg">{randomMessage}</p>
            <p className="text-muted-foreground">Génération en cours...</p>
          </div>
        )}

        {step === 7 && imageUrl && (
          <div className="text-center space-y-4">
            <img
              src={imageUrl}
              alt="Avatar généré"
              className="rounded-xl shadow-md max-w-full"
            />
            <div className="flex gap-4 justify-center mt-4">
              <Button
                className="w-full"
                onClick={() => {
                  window.open(imageUrl, "_blank", "noopener,noreferrer");
                }}
              >
                Télécharger
              </Button>

              <Button variant="secondary" className="w-full" onClick={restart}>
                Recommencer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MercedesCLA;
