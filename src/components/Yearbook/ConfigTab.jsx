import React, { useState, useEffect } from "react";
import yearbookService from "@/services/yearbook.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, RotateCcw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConfigTab = () => {
  const [config, setConfig] = useState({
    code: "",
    promptTemplate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const defaultPrompt = `Transform this portrait photo of {{name}} ({{gender}}) into a classic American high school yearbook style photo from the 1980s-1990s. Create a nostalgic prom night yearbook aesthetic with soft lighting, formal pose, clean background, and that timeless yearbook look. Maintain {{name}}'s facial features while giving them a youthful, student-like appearance suitable for a prom night yearbook page.`;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await yearbookService.getConfig();
      setConfig({
        code: data.code || "",
        promptTemplate: data.promptTemplate || defaultPrompt,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la config:", error);
      // Si pas de config, utiliser les valeurs par défaut
      setConfig({
        code: "",
        promptTemplate: defaultPrompt,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.code.trim()) {
      toast({
        title: "Erreur",
        description: "Le code de sécurité est requis",
        variant: "destructive",
      });
      return;
    }

    if (!config.promptTemplate.trim()) {
      toast({
        title: "Erreur",
        description: "Le template de prompt est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await yearbookService.updateConfig({
        code: config.code.trim(),
        promptTemplate: config.promptTemplate.trim(),
      });

      toast({
        title: "Succès",
        description: "Configuration sauvegardée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      ...config,
      promptTemplate: defaultPrompt,
    });
  };

  const renderPromptPreview = () => {
    const exampleName = "Marie";
    const exampleGender = "Femme";
    return config.promptTemplate
      .replace(/{{name}}/g, exampleName)
      .replace(/{{gender}}/g, exampleGender);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement de la configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Yearbook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code de sécurité */}
          <div className="space-y-2">
            <Label htmlFor="security-code">Code de sécurité</Label>
            <Input
              id="security-code"
              placeholder="Entrez le code d'accès"
              value={config.code}
              onChange={(e) => setConfig({ ...config, code: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Ce code sera demandé aux utilisateurs pour accéder au service
              Yearbook
            </p>
          </div>

          {/* Template de prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt-template">Template de prompt OpenAI</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </Button>
            </div>
            <Textarea
              id="prompt-template"
              placeholder="Entrez le template de prompt..."
              value={config.promptTemplate}
              onChange={(e) =>
                setConfig({ ...config, promptTemplate: e.target.value })
              }
              rows={6}
              className="font-mono text-sm"
            />
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Variables disponibles :</strong>
                <br />• <code>{"{{name}}"}</code> - Le prénom de l'utilisateur
                <br />• <code>{"{{gender}}"}</code> - Le genre de l'utilisateur
                (Homme, Femme, Autre)
                <br />
                Utilisez ces variables dans votre prompt pour personnaliser la
                génération.
              </AlertDescription>
            </Alert>
          </div>

          {/* Prévisualisation */}
          {config.promptTemplate && (
            <div className="space-y-2">
              <Label>
                Prévisualisation du prompt (avec nom "Marie" et genre "Femme")
              </Label>
              <div className="bg-muted p-3 rounded-lg text-sm border">
                {renderPromptPreview()}
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <Button
            onClick={handleSave}
            disabled={
              saving || !config.code.trim() || !config.promptTemplate.trim()
            }
            className="w-full"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informations supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Fonctionnement :</strong>
              <p className="text-muted-foreground">
                Les utilisateurs devront saisir le code de sécurité et uploader
                une photo. L'IA générera ensuite une version "yearbook" de leur
                photo en utilisant le prompt configuré.
              </p>
            </div>
            <div>
              <strong>Conseils pour le prompt :</strong>
              <p className="text-muted-foreground">
                Soyez spécifique sur le style souhaité (années 80-90, éclairage,
                pose, arrière-plan). Mentionnez que les traits du visage doivent
                être préservés.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigTab;
