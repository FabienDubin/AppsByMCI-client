import React, { useState, useEffect } from "react";
import linksService from "@/services/links.service";

//COMPONENTS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

//ICONS
import { Upload, X, FileText, RotateCcw } from "lucide-react";

const LinksForm = ({
  link,
  isCreating,
  linkType,
  onSave,
  onCancel,
  loading,
}) => {
  const { toast } = useToast();

  // STATES
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    url: "",
    isActive: true,
    publishDate: null,
    unpublishDate: null,
    allowCalendarSubscription: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});

  // EFFECTS
  useEffect(() => {
    if (link && !isCreating) {
      setFormData({
        title: link.title || "",
        slug: link.slug || "",
        url: link.type === "url" ? link.url : "",
        isActive: link.isActive ?? true,
        publishDate: link.publishDate ? new Date(link.publishDate) : null,
        unpublishDate: link.unpublishDate ? new Date(link.unpublishDate) : null,
        allowCalendarSubscription: link.allowCalendarSubscription ?? false,
      });
      setSlugManuallyEdited(true);
    }
  }, [link, isCreating]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const generatedSlug = linksService.generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  // HANDLERS
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSlugChange = (value) => {
    setSlugManuallyEdited(true);
    handleInputChange("slug", value);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!linksService.isSupportedFileType(file)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Types supportés : Images, PDF, ZIP, Vidéos, ICS",
          variant: "destructive",
        });
        return;
      }

      // Vérifier la taille (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Taille maximum : 100MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Auto-générer le titre et slug si vides
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        handleInputChange("title", fileName);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDateChange = (field, date) => {
    handleInputChange(field, date);
  };

  const handleResetSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      publishDate: null,
      unpublishDate: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Titre requis
    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    }

    // Slug requis et valide
    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis";
    } else if (!linksService.isValidSlug(formData.slug)) {
      newErrors.slug =
        "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets";
    }

    // URL requise pour les liens URL
    if (linkType === "url" && !formData.url.trim()) {
      newErrors.url = "L'URL est requise";
    }

    // Fichier requis pour les nouveaux liens fichier
    if (linkType === "file" && isCreating && !selectedFile) {
      newErrors.file = "Un fichier est requis";
    }

    // Validation des dates
    if (formData.publishDate && formData.unpublishDate) {
      if (formData.publishDate >= formData.unpublishDate) {
        newErrors.unpublishDate =
          "La date de dépublication doit être postérieure à la date de publication";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Préparer les données à envoyer
    const submitData = {
      ...formData,
      type: "url", // Ajouté pour correspondre à l'attente du backend
      publishDate: formData.publishDate
        ? formData.publishDate.toISOString()
        : null,
      unpublishDate: formData.unpublishDate
        ? formData.unpublishDate.toISOString()
        : null,
    };

    onSave(submitData, selectedFile);
  };

  const getFilePreview = () => {
    if (!selectedFile) return null;

    const fileType = linksService.getExtensionFromMimetype(selectedFile.type);
    const isImage = selectedFile.type.startsWith("image/");

    return (
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <FileText className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <div className="text-sm font-medium">{selectedFile.name}</div>
          <div className="text-xs text-gray-500">
            {linksService.formatFileSize(selectedFile.size)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveFile}
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations générales</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Nom du lien"
            disabled={loading}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-personnalisee"
              disabled={loading}
            />
            <Badge variant="outline" className="text-xs">
              appsbymci.com/links/{formData.slug || "slug"}
            </Badge>
          </div>
          {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
        </div>
      </div>

      {/* Section URL ou Fichier */}
      {linkType === "url" ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">URL de destination</h3>
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              placeholder="https://exemple.com"
              disabled={loading}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fichier</h3>

          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="file">
              {isCreating ? "Fichier *" : "Nouveau fichier (optionnel)"}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {selectedFile ? (
                getFilePreview()
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-input").click()
                      }
                      disabled={loading}
                    >
                      Choisir un fichier
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Types supportés : Images, PDF, ZIP, Vidéos, ICS (Max: 100MB)
                  </p>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip,.mp4,.avi,.mov,.wmv,.ics"
              />
            </div>
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          {/* Option abonnement calendrier pour ICS */}
          {(selectedFile?.name.endsWith(".ics") ||
            link?.fileType === "ics") && (
            <div className="flex items-center space-x-2">
              <Switch
                id="allowCalendarSubscription"
                checked={formData.allowCalendarSubscription}
                onCheckedChange={(checked) =>
                  handleInputChange("allowCalendarSubscription", checked)
                }
                disabled={loading}
              />
              <Label htmlFor="allowCalendarSubscription">
                Permettre l'abonnement calendrier
              </Label>
            </div>
          )}
        </div>
      )}

      {/* État et planification */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">État et planification</h3>
          {(formData.publishDate || formData.unpublishDate) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetSchedule}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset dates
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              handleInputChange("isActive", checked)
            }
            disabled={loading}
          />
          <Label htmlFor="isActive">Lien actif</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publishDate">Date de publication</Label>
            <DateInput
              id="publishDate"
              value={formData.publishDate}
              onChange={(date) => handleDateChange("publishDate", date)}
              placeholder="JJ/MM/AAAA ou vide"
              disabled={loading}
              error={!!errors.publishDate}
            />
            {errors.publishDate && (
              <p className="text-sm text-red-500">{errors.publishDate}</p>
            )}
            <p className="text-xs text-gray-500">Laisser vide pour "toujours actif"</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unpublishDate">Date de dépublication</Label>
            <DateInput
              id="unpublishDate"
              value={formData.unpublishDate}
              onChange={(date) => handleDateChange("unpublishDate", date)}
              placeholder="JJ/MM/AAAA ou vide"
              disabled={loading}
              error={!!errors.unpublishDate}
            />
            {errors.unpublishDate && (
              <p className="text-sm text-red-500">{errors.unpublishDate}</p>
            )}
            <p className="text-xs text-gray-500">Laisser vide pour "jamais"</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Sauvegarde..." : isCreating ? "Créer" : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
};

export default LinksForm;
