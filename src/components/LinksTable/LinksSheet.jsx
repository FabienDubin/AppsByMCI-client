import React, { useState, useEffect } from "react";
import linksService from "@/services/links.service";

//COMPONENTS
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LinksForm from "./LinksForm";
import IcsGenerator from "../IcsGenerator/IcsGenerator";

//ICONS
import { Link, Upload, Calendar } from "lucide-react";

const LinksSheet = ({ open, onClose, link, isCreating }) => {
  const { toast } = useToast();

  // STATES
  const [activeTab, setActiveTab] = useState("url");
  const [loading, setLoading] = useState(false);

  // EFFECTS
  useEffect(() => {
    if (open) {
      if (isCreating) {
        setActiveTab("url");
      } else if (link) {
        // Déterminer l'onglet approprié selon le type de lien
        if (link.type === "url") {
          setActiveTab("url");
        } else if (link.isGeneratedIcs) {
          setActiveTab("ics-generator");
        } else {
          setActiveTab("file");
        }
      }
    }
  }, [open, isCreating, link]);

  // HANDLERS
  const handleSave = async (linkData, file = null, eventData = null) => {
    try {
      setLoading(true);

      let response;

      if (isCreating) {
        // Création d'un nouveau lien
        if (activeTab === "url") {
          response = await linksService.createUrlLink(linkData);
        } else if (activeTab === "file") {
          response = await linksService.createFileLink(linkData, file);
        } else if (activeTab === "ics-generator") {
          const icsData = {
            ...linkData,
            eventData
          };
          response = await linksService.generateIcsEvent(icsData);
        }
      } else {
        // Modification d'un lien existant
        if (link.isGeneratedIcs && activeTab === "ics-generator") {
          response = await linksService.updateIcsEvent(link._id, eventData);
        } else if (file) {
          response = await linksService.updateFileLink(link._id, linkData, file);
        } else {
          response = await linksService.updateLink(link._id, linkData);
        }
      }

      toast({
        title: "Succès",
        description: isCreating ? "Lien créé avec succès" : "Lien mis à jour avec succès",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getSheetTitle = () => {
    if (isCreating) {
      return "Créer un nouveau lien";
    }
    return `Éditer : ${link?.title}`;
  };

  const getTabsContent = () => {
    if (isCreating) {
      // Mode création : afficher tous les onglets
      return (
        <>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>URL</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Fichier</span>
            </TabsTrigger>
            <TabsTrigger value="ics-generator" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Événement</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4">
            <LinksForm
              link={null}
              isCreating={true}
              linkType="url"
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="file" className="mt-4">
            <LinksForm
              link={null}
              isCreating={true}
              linkType="file"
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="ics-generator" className="mt-4">
            <IcsGenerator
              link={null}
              isCreating={true}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
            />
          </TabsContent>
        </>
      );
    } else {
      // Mode édition : afficher seulement l'onglet approprié
      if (link?.isGeneratedIcs) {
        return (
          <>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="ics-generator" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Événement</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ics-generator" className="mt-4">
              <IcsGenerator
                link={link}
                isCreating={false}
                onSave={handleSave}
                onCancel={handleCancel}
                loading={loading}
              />
            </TabsContent>
          </>
        );
      } else {
        const tabIcon = link?.type === "url" ? <Link className="h-4 w-4" /> : <Upload className="h-4 w-4" />;
        const tabLabel = link?.type === "url" ? "URL" : "Fichier";
        const tabValue = link?.type === "url" ? "url" : "file";

        return (
          <>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value={tabValue} className="flex items-center space-x-2">
                {tabIcon}
                <span>{tabLabel}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tabValue} className="mt-4">
              <LinksForm
                link={link}
                isCreating={false}
                linkType={link?.type}
                onSave={handleSave}
                onCancel={handleCancel}
                loading={loading}
              />
            </TabsContent>
          </>
        );
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getSheetTitle()}</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {getTabsContent()}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LinksSheet;