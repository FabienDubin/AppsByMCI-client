import astronautService from "@/services/astronaut.service";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
//COMPONENTS
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const createDefaultQuestion = () => ({
  text: "",
  options: [
    { label: "", value: "A" },
    { label: "", value: "B" },
    { label: "", value: "C" },
    { label: "", value: "D" },
  ],
});

const ConfigTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [questions, setQuestions] = useState(
    Array(5).fill(null).map(createDefaultQuestion)
  );
  const [promptTemplate, setPromptTemplate] = useState("");

  const { toast } = useToast();

  //Fetching an existing config
  const fetchConfig = async () => {
    try {
      const response = await astronautService.getConfig();
      const config = response;
      console.log("config", config);
      setCode(config.code || "");
      setPromptTemplate(config.promptTemplate || "");
      setQuestions(
        config.questions && config.questions.length === 5
          ? config.questions
          : Array(5).fill(null).map(createDefaultQuestion)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index, text) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].label = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    const req = { code: code, promptTemplate: promptTemplate, questions };
    // console.log(req);
    try {
      const response = await astronautService.updateConfig(req);
      console.log("response", response.data);
      toast({
        title: "Excellent !",
        description: "Configuration mise à jour avec succès!",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la configuration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchConfig();
  }, []);

  return (
    <div className="w-full min-h-screen">
      <h1 className="text-center text-lg font-medium my-4">
        Ici tu peux configurer les questions du quiz d'astronaute et optimiser
        le prompt pour la génération de l'avatar.
      </h1>
      {isLoading && (
        <div className="flex items-center justify-center h-screen">
          Chargement en cours...
        </div>
      )}
      {questions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {questions.map((q, qIndex) => (
            <AccordionItem key={`q${qIndex}`} value={`item-${qIndex}`}>
              <AccordionTrigger>Question {qIndex + 1}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label>Intitulé de la question</Label>
                  <Input
                    value={q.text}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, e.target.value)
                    }
                    placeholder={`Question ${qIndex + 1}`}
                  />

                  <div className="mt-4 space-y-2">
                    <Label>Réponses :</Label>
                    {["A", "B", "C", "D"].map((letter, optIndex) => (
                      <div
                        key={letter}
                        className="flex items-center gap-2 ml-2"
                      >
                        <span className="w-6 font-mono">{letter}.</span>
                        <Input
                          value={q.options[optIndex].label}
                          onChange={(e) =>
                            handleOptionChange(qIndex, optIndex, e.target.value)
                          }
                          placeholder={`Réponse ${letter}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="code">
            <AccordionTrigger>Code de la session</AccordionTrigger>
            <AccordionContent>
              Ce code de sécurité permet de vérifier que le quiz d'astronaute
              est lancé par un utilisateur autorisé. Il doit être fourni lors du
              début de la session.
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code de sécurité"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="prompt">
            <AccordionTrigger>Prompt de génération</AccordionTrigger>
            <AccordionContent>
              Tu peux éditer le prompt pour la génération de l'avatar
              d'astronaute mais assure toi de garder les variables qui
              permettent la personnalisation <code>{"{{name}}"}</code>,{" "}
              <code>{"{{gender}}"}</code>, <code>{"{{answers}}"}</code>.
              <Textarea
                className="h-48"
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                placeholder="Prompt de génération d'avatar d'astronaute"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <div className="flex justify-end mt-10">
        <Button className="w-48" onClick={handleSubmit}>
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default ConfigTab;
