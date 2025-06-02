import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Response({ open, onOpenChange, response }) {
  //Download the image
  const handleImageDownload = () => {
    const a = document.createElement("a");
    a.href = response.imageUrl;
    a.download = `Avatar_de_${response?.name}.png`; // ça ne fonctionne que si l'image est publique
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="mt-4 text-xl uppercase ">
            Détails de {response?.name}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          <div>
            <strong>Genre :</strong> {response?.gender}
          </div>
          <div>
            <strong>Réponses :</strong> {response?.answers?.join(", ")}
          </div>
          <div>
            <strong>Date :</strong>
            {new Date(response?.createdAt).toLocaleString("fr-FR")}
          </div>

          {response?.imageUrl && (
            <div className="relative">
              <img
                src={response.imageUrl}
                alt="Avatar"
                className="w-full rounded shadow"
              />
              <Button
                className="absolute bottom-0 right-0 m-2"
                onClick={handleImageDownload}
              >
                <Download />
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
