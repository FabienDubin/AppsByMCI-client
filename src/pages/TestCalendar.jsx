import React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Composant de test pour le calendrier avec sélection de date
const TestCalendar = () => {
  // États pour stocker les dates sélectionnées
  const [date, setDate] = React.useState();
  const [publishDate, setPublishDate] = React.useState();
  const [publishDateOpen, setPublishDateOpen] = React.useState(false);
  
  const handleDateChange = (newDate) => {
    setPublishDate(newDate);
    // Fermer le popover après sélection avec un petit délai
    setTimeout(() => {
      setPublishDateOpen(false);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Test Calendar</h1>
      
      {/* Test calendrier simple */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Calendrier Simple</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? date.toLocaleDateString("fr-FR") : "Choisir une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
        <div className="mt-4 p-4 border rounded bg-muted">
          {date ? (
            <>Date sélectionnée : <b>{date.toLocaleDateString("fr-FR")}</b></>
          ) : (
            <>Aucune date sélectionnée</>
          )}
        </div>
      </div>

      {/* Test calendrier comme dans LinksForm */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Calendrier LinksForm Style</h2>
        <Popover open={publishDateOpen} onOpenChange={setPublishDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {publishDate ? (
                format(publishDate, "PPP", { locale: fr })
              ) : (
                <span>Toujours actif</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={publishDate}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
        <div className="mt-4 p-4 border rounded bg-muted">
          {publishDate ? (
            <>Date de publication : <b>{format(publishDate, "PPP", { locale: fr })}</b></>
          ) : (
            <>Aucune date de publication</>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCalendar;
