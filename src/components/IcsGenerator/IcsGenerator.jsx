import React, { useState, useEffect } from "react";
import linksService from "@/services/links.service";

//COMPONENTS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

//ICONS
import { Clock, MapPin, User, RotateCcw, Eye, Calendar as CalendarIcon } from "lucide-react";
import { addHours, format } from "date-fns";
import { fr } from "date-fns/locale";

const IcsGenerator = ({ link, isCreating, onSave, onCancel, loading }) => {
  const { toast } = useToast();

  // STATES
  const [linkData, setLinkData] = useState({
    title: "",
    slug: "",
    isActive: true,
    publishDate: null,
    unpublishDate: null,
    allowCalendarSubscription: true,
  });

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: null,
    endDate: null,
    allDay: false,
    recurrence: "none",
    organizer: {
      name: "",
      email: "",
    },
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // EFFECTS
  useEffect(() => {
    if (link && !isCreating) {
      setLinkData({
        title: link.title || "",
        slug: link.slug || "",
        isActive: link.isActive ?? true,
        publishDate: link.publishDate ? new Date(link.publishDate) : null,
        unpublishDate: link.unpublishDate ? new Date(link.unpublishDate) : null,
        allowCalendarSubscription: link.allowCalendarSubscription ?? true,
      });

      if (link.eventData) {
        setEventData({
          title: link.eventData.title || "",
          description: link.eventData.description || "",
          location: link.eventData.location || "",
          startDate: link.eventData.startDate ? new Date(link.eventData.startDate) : null,
          endDate: link.eventData.endDate ? new Date(link.eventData.endDate) : null,
          allDay: link.eventData.allDay ?? false,
          recurrence: link.eventData.recurrence || "none",
          organizer: {
            name: link.eventData.organizer?.name || "",
            email: link.eventData.organizer?.email || "",
          },
        });
      }

      setSlugManuallyEdited(true);
    }
  }, [link, isCreating]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && linkData.title) {
      const generatedSlug = linksService.generateSlug(linkData.title);
      setLinkData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [linkData.title, slugManuallyEdited]);

  // Auto-generate link title from event title
  useEffect(() => {
    if (eventData.title && !slugManuallyEdited) {
      setLinkData(prev => ({ ...prev, title: eventData.title }));
    }
  }, [eventData.title, slugManuallyEdited]);

  // Auto-adjust end date when start date changes
  useEffect(() => {
    if (eventData.startDate && !eventData.endDate) {
      const endDate = eventData.allDay 
        ? eventData.startDate 
        : addHours(eventData.startDate, 1);
      setEventData(prev => ({ ...prev, endDate }));
    }
  }, [eventData.startDate, eventData.allDay]);

  // RECURRENCE OPTIONS
  const recurrenceOptions = [
    { value: "none", label: "Aucune récurrence" },
    { value: "FREQ=DAILY", label: "Quotidienne" },
    { value: "FREQ=WEEKLY", label: "Hebdomadaire" },
    { value: "FREQ=MONTHLY", label: "Mensuelle" },
    { value: "FREQ=YEARLY", label: "Annuelle" },
    { value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", label: "Jours ouvrables" },
  ];

  // HANDLERS
  const handleLinkDataChange = (field, value) => {
    setLinkData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleEventDataChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleOrganizerChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      organizer: { ...prev.organizer, [field]: value }
    }));
  };

  const handleSlugChange = (value) => {
    setSlugManuallyEdited(true);
    handleLinkDataChange("slug", value);
  };

  const handleAllDayToggle = (checked) => {
    setEventData(prev => {
      const newData = { ...prev, allDay: checked };
      
      // Si on passe en journée entière, ajuster les dates
      if (checked && prev.startDate) {
        newData.endDate = prev.startDate;
      }
      
      return newData;
    });
  };

  const handleDateChange = (field, date, isLinkDate = false) => {
    if (isLinkDate) {
      handleLinkDataChange(field, date);
    } else {
      handleEventDataChange(field, date);
    }
  };

  const handleTimeChange = (field, time) => {
    if (!eventData[field === 'startTime' ? 'startDate' : 'endDate']) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const dateField = field === 'startTime' ? 'startDate' : 'endDate';
    const currentDate = new Date(eventData[dateField]);
    
    currentDate.setHours(hours, minutes, 0, 0);
    handleEventDataChange(dateField, currentDate);
  };

  const handleResetSchedule = () => {
    setLinkData(prev => ({
      ...prev,
      publishDate: null,
      unpublishDate: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation du lien
    if (!linkData.title.trim()) {
      newErrors.title = "Le titre du lien est requis";
    }

    if (!linkData.slug.trim()) {
      newErrors.slug = "Le slug est requis";
    } else if (!linksService.isValidSlug(linkData.slug)) {
      newErrors.slug = "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets";
    }

    // Validation de l'événement
    if (!eventData.title.trim()) {
      newErrors.eventTitle = "Le titre de l'événement est requis";
    }

    if (!eventData.startDate) {
      newErrors.startDate = "La date de début est requise";
    }

    if (!eventData.endDate) {
      newErrors.endDate = "La date de fin est requise";
    }

    if (eventData.startDate && eventData.endDate && eventData.startDate >= eventData.endDate) {
      newErrors.endDate = "La date de fin doit être postérieure à la date de début";
    }

    // Validation des dates de planification
    if (linkData.publishDate && linkData.unpublishDate) {
      if (linkData.publishDate >= linkData.unpublishDate) {
        newErrors.unpublishDate = "La date de dépublication doit être postérieure à la date de publication";
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
    const submitLinkData = {
      ...linkData,
      publishDate: linkData.publishDate ? linkData.publishDate.toISOString() : null,
      unpublishDate: linkData.unpublishDate ? linkData.unpublishDate.toISOString() : null,
    };

    const submitEventData = {
      ...eventData,
      startDate: eventData.startDate ? eventData.startDate.toISOString() : null,
      endDate: eventData.endDate ? eventData.endDate.toISOString() : null,
      recurrence: eventData.recurrence === "none" ? "" : eventData.recurrence,
    };

    onSave(submitLinkData, null, submitEventData);
  };

  const formatTimeForInput = (date) => {
    if (!date) return "";
    return format(date, "HH:mm");
  };

  const getEventPreview = () => {
    if (!eventData.title || !eventData.startDate) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Aperçu de l'événement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>{eventData.title}</strong></div>
          {eventData.description && <div className="text-gray-700">{eventData.description}</div>}
          {eventData.location && (
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{eventData.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {format(eventData.startDate, "PPP", { locale: fr })}
              {!eventData.allDay && ` à ${format(eventData.startDate, "HH:mm")}`}
              {eventData.endDate && eventData.endDate !== eventData.startDate && (
                ` - ${format(eventData.endDate, eventData.allDay ? "PPP" : "HH:mm", { locale: fr })}`
              )}
            </span>
          </div>
          {eventData.recurrence && eventData.recurrence !== "none" && (
            <Badge variant="outline">
              Récurrence : {recurrenceOptions.find(opt => opt.value === eventData.recurrence)?.label}
            </Badge>
          )}
          {(eventData.organizer.name || eventData.organizer.email) && (
            <div className="flex items-center space-x-1 text-gray-600">
              <User className="h-4 w-4" />
              <span>
                {eventData.organizer.name} 
                {eventData.organizer.email && ` (${eventData.organizer.email})`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations du lien */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations du lien</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Titre du lien *</Label>
          <Input
            id="title"
            value={linkData.title}
            onChange={(e) => handleLinkDataChange("title", e.target.value)}
            placeholder="Nom du lien (sera généré automatiquement depuis l'événement)"
            disabled={loading}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="slug"
              value={linkData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-personnalisee"
              disabled={loading}
            />
            <Badge variant="outline" className="text-xs">
              appsbymci.com/links/{linkData.slug || "slug"}
            </Badge>
          </div>
          {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
        </div>
      </div>

      {/* Informations de l'événement */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Détails de l'événement</h3>
        
        <div className="space-y-2">
          <Label htmlFor="eventTitle">Titre de l'événement *</Label>
          <Input
            id="eventTitle"
            value={eventData.title}
            onChange={(e) => handleEventDataChange("title", e.target.value)}
            placeholder="Nom de l'événement"
            disabled={loading}
          />
          {errors.eventTitle && <p className="text-sm text-red-500">{errors.eventTitle}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={eventData.description}
            onChange={(e) => handleEventDataChange("description", e.target.value)}
            placeholder="Description de l'événement"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            value={eventData.location}
            onChange={(e) => handleEventDataChange("location", e.target.value)}
            placeholder="Adresse ou lieu de l'événement"
            disabled={loading}
          />
        </div>

        {/* Dates et heures */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="allDay"
              checked={eventData.allDay}
              onCheckedChange={handleAllDayToggle}
              disabled={loading}
            />
            <Label htmlFor="allDay">Événement sur toute la journée</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début *</Label>
              <DateInput
                id="startDate"
                value={eventData.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                placeholder="JJ/MM/AAAA"
                disabled={loading}
                error={!!errors.startDate}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin *</Label>
              <DateInput
                id="endDate"
                value={eventData.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                placeholder="JJ/MM/AAAA"
                disabled={loading}
                error={!!errors.endDate}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {!eventData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formatTimeForInput(eventData.startDate)}
                  onChange={(e) => handleTimeChange("startTime", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formatTimeForInput(eventData.endDate)}
                  onChange={(e) => handleTimeChange("endTime", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Récurrence */}
        <div className="space-y-2">
          <Label htmlFor="recurrence">Récurrence</Label>
          <Select
            value={eventData.recurrence}
            onValueChange={(value) => handleEventDataChange("recurrence", value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une récurrence" />
            </SelectTrigger>
            <SelectContent>
              {recurrenceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organisateur */}
        <div className="space-y-4">
          <h4 className="font-medium">Organisateur</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizerName">Nom</Label>
              <Input
                id="organizerName"
                value={eventData.organizer.name}
                onChange={(e) => handleOrganizerChange("name", e.target.value)}
                placeholder="Nom de l'organisateur"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizerEmail">Email</Label>
              <Input
                id="organizerEmail"
                type="email"
                value={eventData.organizer.email}
                onChange={(e) => handleOrganizerChange("email", e.target.value)}
                placeholder="email@exemple.com"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          disabled={loading}
        >
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? "Masquer" : "Aperçu"}
        </Button>
        {showPreview && getEventPreview()}
      </div>

      {/* Configuration du lien */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Configuration du lien</h3>
          {(linkData.publishDate || linkData.unpublishDate) && (
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
            checked={linkData.isActive}
            onCheckedChange={(checked) => handleLinkDataChange("isActive", checked)}
            disabled={loading}
          />
          <Label htmlFor="isActive">Lien actif</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="allowCalendarSubscription"
            checked={linkData.allowCalendarSubscription}
            onCheckedChange={(checked) => handleLinkDataChange("allowCalendarSubscription", checked)}
            disabled={loading}
          />
          <Label htmlFor="allowCalendarSubscription">
            Permettre l'abonnement calendrier
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publishDate">Date de publication</Label>
            <DateInput
              id="publishDate"
              value={linkData.publishDate}
              onChange={(date) => handleDateChange("publishDate", date, true)}
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
              value={linkData.unpublishDate}
              onChange={(date) => handleDateChange("unpublishDate", date, true)}
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
          {loading ? "Génération..." : (isCreating ? "Créer l'événement" : "Mettre à jour")}
        </Button>
      </div>
    </form>
  );
};

export default IcsGenerator;