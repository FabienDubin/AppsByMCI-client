import eventManagerService from "@/services/eventmanager.service";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
// UI
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
import { X } from "lucide-react";

const createDefaultQuestion = () => ({
  text: "",
  type: "choice",
  options: Array(2).fill({ label: "", prompt_value: "" }),
});

const ConfigTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allowedDomains, setAllowedDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [questions, setQuestions] = useState(
    Array(5).fill(null).map(createDefaultQuestion)
  );
  const [promptTemplate, setPromptTemplate] = useState("");

  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const config = await eventManagerService.getConfig();
      setAllowedDomains(config.allowedDomains || []);
      setPromptTemplate(config.promptTemplate || "");
      setQuestions(
        config.questions && config.questions.length === 5
          ? config.questions
          : Array(5).fill(null).map(createDefaultQuestion)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index, text) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx][field] = value;
    setQuestions(updated);
  };

  const handleAddDomain = () => {
    const domain = newDomain.trim();
    if (
      !domain.startsWith("@") ||
      !domain.includes(".") ||
      allowedDomains.includes(domain)
    ) {
      toast({
        title: "Erreur",
        description:
          "Le domaine doit commencer par @, contenir un point, et ne pas être déjà présent.",
        variant: "destructive",
      });
      return;
    }
    setAllowedDomains([...allowedDomains, domain]);
    setNewDomain("");
  };

  const handleRemoveDomain = (domain) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
  };

  const handleSubmit = async () => {
    const body = { allowedDomains, promptTemplate, questions };
    try {
      await eventManagerService.updateConfig(body);
      toast({
        title: "Succès",
        description: "Configuration mise à jour",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur",
        description: "Echec de mise à jour",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="w-full min-h-screen">
      <h1 className="text-center text-lg font-medium my-4">
        Configurez les questions du quiz Event Manager, le prompt et les
        domaines autorisés.
      </h1>
      {isLoading && (
        <div className="flex items-center justify-center h-screen">
          Chargement...
        </div>
      )}
      {!isLoading && (
        <>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="domains">
              <AccordionTrigger>Domaines autorisés</AccordionTrigger>
              <AccordionContent>
                <div className="mb-2">
                  {allowedDomains.length === 0 && (
                    <div className="text-muted-foreground text-sm mb-2">
                      Aucun domaine autorisé.
                    </div>
                  )}
                  <ul className="mb-2">
                    {allowedDomains.map((domain) => (
                      <li key={domain} className="flex items-center gap-2 mb-1">
                        <span className="font-mono">{domain}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveDomain(domain)}
                          aria-label="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="@exemple.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddDomain();
                      }}
                    />
                    <Button onClick={handleAddDomain}>Ajouter</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Exemple : <span className="font-mono">@wearemci.com</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {questions.map((q, qi) => (
              <AccordionItem key={qi} value={`q${qi}`}>
                <AccordionTrigger>Question {qi + 1}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Label>Intitulé</Label>
                    <Input
                      value={q.text}
                      onChange={(e) => handleQuestionChange(qi, e.target.value)}
                    />
                    <div className="mt-4 space-y-2">
                      <Label>Options :</Label>
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className="flex flex-col gap-2 border p-2 rounded-md"
                        >
                          <Input
                            placeholder="Label"
                            value={opt.label}
                            onChange={(e) =>
                              handleOptionChange(
                                qi,
                                oi,
                                "label",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Prompt value"
                            value={opt.prompt_value}
                            onChange={(e) =>
                              handleOptionChange(
                                qi,
                                oi,
                                "prompt_value",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            <AccordionItem value="prompt">
              <AccordionTrigger>Prompt template</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="h-48"
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end mt-8">
            <Button onClick={handleSubmit}>Sauvegarder</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfigTab;
