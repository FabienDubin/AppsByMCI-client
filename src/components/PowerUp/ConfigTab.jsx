import powerUpService from "@/services/powerup.service";
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
  options: Array(4)
    .fill(null)
    .map(() => ({
      label: "",
      value: "",
      scores: {
        catalyseur: 0,
        analyseur: 0,
        acceleratrice: 0,
        visionnaire: 0,
      },
    })),
});

const createDefaultProfile = () => ({
  id: "",
  name: "",
  emblem: "",
  backgroundStyle: "",
  pitch: "",
});

const ConfigTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [allowedDomains, setAllowedDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [questions, setQuestions] = useState(
    Array(4).fill(null).map(createDefaultQuestion)
  );
  const [profiles, setProfiles] = useState(
    Array(4).fill(null).map(createDefaultProfile)
  );
  const [promptTemplate, setPromptTemplate] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [logoImageUrl, setLogoImageUrl] = useState("");

  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const config = await powerUpService.getConfig();
      setCode(config.code || "");
      setAllowedDomains(config.allowedDomains || []);
      setPromptTemplate(config.promptTemplate || "");
      setBackgroundImageUrl(config.backgroundImageUrl || "");
      setLogoImageUrl(config.logoImageUrl || "");
      setQuestions(
        config.questions && config.questions.length === 4
          ? config.questions
          : Array(4).fill(null).map(createDefaultQuestion)
      );
      setProfiles(
        config.profiles && config.profiles.length === 4
          ? config.profiles
          : Array(4).fill(null).map(createDefaultProfile)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index, text) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], text };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, field, value) => {
    const updated = [...questions];
    if (field.startsWith("scores.")) {
      const scoreField = field.split(".")[1];
      updated[qIdx].options[optIdx] = {
        ...updated[qIdx].options[optIdx],
        scores: {
          ...updated[qIdx].options[optIdx].scores,
          [scoreField]: Number(value) || 0,
        },
      };
    } else {
      updated[qIdx].options[optIdx] = {
        ...updated[qIdx].options[optIdx],
        [field]: value,
      };
    }
    setQuestions(updated);
  };

  const handleProfileChange = (index, field, value) => {
    const updated = [...profiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfiles(updated);
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
    const body = { code, allowedDomains, promptTemplate, questions, profiles, backgroundImageUrl, logoImageUrl };
    try {
      await powerUpService.updateConfig(body);
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

  const profileIds = ["catalyseur", "analyseur", "acceleratrice", "visionnaire"];
  const profileLabels = {
    catalyseur: "Le Catalyseur",
    analyseur: "L'Analyseur Quantique",
    acceleratrice: "L'Accélératrice",
    visionnaire: "Le Visionnaire Créatif",
  };

  return (
    <div className="w-full min-h-screen">
      <h1 className="text-center text-lg font-medium my-4">
        Configurez les questions du quiz Power Up, les profils, le prompt et les
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
            {/* Code d'accès */}
            <AccordionItem value="code">
              <AccordionTrigger>Code d'accès</AccordionTrigger>
              <AccordionContent>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code d'accès"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Images de référence */}
            <AccordionItem value="images">
              <AccordionTrigger>Images de référence</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <Label>URL du fond (background)</Label>
                    <Input
                      value={backgroundImageUrl}
                      onChange={(e) => setBackgroundImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    {backgroundImageUrl && (
                      <img
                        src={backgroundImageUrl}
                        alt="Background preview"
                        className="mt-2 h-20 rounded border"
                      />
                    )}
                  </div>
                  <div>
                    <Label>URL du logo Power Up</Label>
                    <Input
                      value={logoImageUrl}
                      onChange={(e) => setLogoImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    {logoImageUrl && (
                      <img
                        src={logoImageUrl}
                        alt="Logo preview"
                        className="mt-2 h-12 rounded border bg-gray-800 p-2"
                      />
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Domaines autorisés */}
            <AccordionItem value="domains">
              <AccordionTrigger>Domaines autorisés</AccordionTrigger>
              <AccordionContent>
                <div className="mb-2">
                  {allowedDomains.length === 0 && (
                    <div className="text-muted-foreground text-sm mb-2">
                      Aucun domaine autorisé (tous les emails acceptés).
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
                    Exemple : <span className="font-mono">@arval.com</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Questions */}
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
                    <div className="mt-4 space-y-4">
                      <Label>Options (4 réponses) :</Label>
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className="border p-3 rounded-md space-y-2"
                        >
                          <div className="flex gap-2">
                            <Input
                              placeholder="Label"
                              value={opt.label}
                              onChange={(e) =>
                                handleOptionChange(qi, oi, "label", e.target.value)
                              }
                              className="flex-1"
                            />
                            <Input
                              placeholder="Value"
                              value={opt.value}
                              onChange={(e) =>
                                handleOptionChange(qi, oi, "value", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {profileIds.map((pid) => (
                              <div key={pid} className="flex flex-col">
                                <Label className="text-xs truncate">
                                  {profileLabels[pid]}
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={opt.scores?.[pid] || 0}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qi,
                                      oi,
                                      `scores.${pid}`,
                                      e.target.value
                                    )
                                  }
                                  className="h-8"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Profiles */}
            {profiles.map((p, pi) => (
              <AccordionItem key={pi} value={`profile${pi}`}>
                <AccordionTrigger>
                  Profil : {p.name || profileLabels[profileIds[pi]]}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div>
                      <Label>ID (ne pas modifier)</Label>
                      <Input
                        value={p.id}
                        onChange={(e) =>
                          handleProfileChange(pi, "id", e.target.value)
                        }
                        placeholder="catalyseur, analyseur, etc."
                      />
                    </div>
                    <div>
                      <Label>Nom affiché</Label>
                      <Input
                        value={p.name}
                        onChange={(e) =>
                          handleProfileChange(pi, "name", e.target.value)
                        }
                        placeholder="Le Catalyseur"
                      />
                    </div>
                    <div>
                      <Label>Description de l'emblème (pour le prompt)</Label>
                      <Textarea
                        value={p.emblem}
                        onChange={(e) =>
                          handleProfileChange(pi, "emblem", e.target.value)
                        }
                        placeholder="glowing network of interconnected nodes..."
                        className="h-20"
                      />
                    </div>
                    <div>
                      <Label>Style du fond (pour le prompt)</Label>
                      <Textarea
                        value={p.backgroundStyle}
                        onChange={(e) =>
                          handleProfileChange(pi, "backgroundStyle", e.target.value)
                        }
                        placeholder="warm orange gradient with floating particles..."
                        className="h-20"
                      />
                    </div>
                    <div>
                      <Label>Pitch du profil</Label>
                      <Textarea
                        value={p.pitch}
                        onChange={(e) =>
                          handleProfileChange(pi, "pitch", e.target.value)
                        }
                        placeholder="Expert client & coordinateur d'équipes..."
                        className="h-24"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Prompt template */}
            <AccordionItem value="prompt">
              <AccordionTrigger>Prompt template</AccordionTrigger>
              <AccordionContent>
                <div className="mb-2 text-sm text-muted-foreground">
                  Variables disponibles : {"{{name}}"}, {"{{gender}}"}, {"{{profileName}}"},{" "}
                  {"{{profilePitch}}"}, {"{{emblem}}"}, {"{{backgroundStyle}}"}
                </div>
                <Textarea
                  className="h-64"
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
