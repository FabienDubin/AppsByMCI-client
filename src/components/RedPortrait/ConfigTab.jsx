import { useState, useEffect } from "react";
import redPortraitService from "@/services/redportrait.service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Save, 
  Loader2, 
  Info, 
  Mail, 
  Code, 
  Palette,
  Eye,
  EyeOff 
} from "lucide-react";

const ConfigTab = () => {
  const [config, setConfig] = useState({
    accessCode: "",
    isActive: true,
    emailSubject: "",
    emailTemplate: "",
    promptTemplate: "",
    maxDailySubmissions: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const data = await redPortraitService.getConfig();
      setConfig(data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await redPortraitService.updateConfig(config);
      toast({
        title: "Succès",
        description: "Configuration mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderEmailPreview = () => {
    const previewData = {
      name: "Jean Dupont",
      imageUrl: "https://via.placeholder.com/600x600/ff0000/ffffff?text=Portrait+Rouge+%26+Noir",
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const html = config.emailTemplate.replace(
      /{{(.*?)}}/g,
      (_, key) => previewData[key.trim()] || `{{${key}}}`
    );

    return html;
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* État de l'animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            État de l'animation
          </CardTitle>
          <CardDescription>
            Activez ou désactivez l'accès à Red Portrait
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.isActive}
              onCheckedChange={(checked) =>
                setConfig({ ...config, isActive: checked })
              }
              id="active-mode"
            />
            <Label htmlFor="active-mode">
              {config.isActive ? "Animation active" : "Animation désactivée"}
            </Label>
          </div>
          {!config.isActive && (
            <Alert className="mt-4 border-orange-500">
              <Info className="h-4 w-4" />
              <AlertDescription>
                L'animation est désactivée. Les utilisateurs ne pourront pas accéder à Red Portrait.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Code d'accès */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code d'accès
          </CardTitle>
          <CardDescription>
            Code requis pour accéder à l'animation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accessCode">Code d'accès</Label>
            <Input
              id="accessCode"
              type="text"
              value={config.accessCode}
              onChange={(e) =>
                setConfig({ ...config, accessCode: e.target.value.toUpperCase() })
              }
              placeholder="RED2025"
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="maxSubmissions">Limite quotidienne de soumissions</Label>
            <Input
              id="maxSubmissions"
              type="number"
              value={config.maxDailySubmissions}
              onChange={(e) =>
                setConfig({ ...config, maxDailySubmissions: parseInt(e.target.value) || 100 })
              }
              min="1"
              max="1000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration Email
          </CardTitle>
          <CardDescription>
            Personnalisez le message envoyé aux utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emailSubject">Sujet de l'email</Label>
            <Input
              id="emailSubject"
              type="text"
              value={config.emailSubject}
              onChange={(e) =>
                setConfig({ ...config, emailSubject: e.target.value })
              }
              placeholder="Ton portrait Rouge & Noir est prêt !"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="emailTemplate">Template de l'email (HTML)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Masquer l'aperçu
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir l'aperçu
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="emailTemplate"
              value={config.emailTemplate}
              onChange={(e) =>
                setConfig({ ...config, emailTemplate: e.target.value })
              }
              rows={15}
              className="font-mono text-sm"
              placeholder="Template HTML de l'email..."
            />
            <Alert className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Variables disponibles : {"{{name}}"}, {"{{imageUrl}}"}, {"{{date}}"}
              </AlertDescription>
            </Alert>
          </div>

          {showPreview && (
            <div>
              <Label>Aperçu de l'email</Label>
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                <div 
                  dangerouslySetInnerHTML={{ __html: renderEmailPreview() }}
                  className="max-w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompt OpenAI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Prompt de génération
          </CardTitle>
          <CardDescription>
            Instructions pour la transformation en rouge et noir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.promptTemplate}
            onChange={(e) =>
              setConfig({ ...config, promptTemplate: e.target.value })
            }
            rows={8}
            className="font-mono text-sm"
            placeholder="Instructions pour la génération..."
          />
          <Alert className="mt-2">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Ce prompt sera utilisé pour transformer les selfies en portraits artistiques rouge et noir via l'API OpenAI.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder la configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfigTab;