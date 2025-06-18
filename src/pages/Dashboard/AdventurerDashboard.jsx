import React from "react";
import { Helmet } from "react-helmet-async";
//COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
//MEDIAS
import {
  Compass,
  Cog,
  MessageSquareReply,
  SquareArrowOutUpRight,
} from "lucide-react";
import ConfigTab from "@/components/Adventurer/ConfigTab";
import ResponsesTab from "@/components/Adventurer/ResponsesTab";

const AdventurerDashboard = () => {
  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Dashboard - Profil d'Aventurier</title>
        <meta
          name="description"
          content="Consultez les soumissions des profils d'aventurier."
        />
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="flex items-center text-2xl font-bold p-4 w-full">
          <Compass className="mr-2" />
          Profil d'Aventurier
        </h1>
        <Button
          variant="ghost"
          onClick={() => window.open("/adventurer", "_blank")}
        >
          Go to the app <SquareArrowOutUpRight />
        </Button>
      </div>

      <Tabs defaultValue="responses" className="w-full">
        <TabsList>
          <TabsTrigger value="responses">
            <MessageSquareReply className="mr-2" /> Soumissions
          </TabsTrigger>
          <TabsTrigger value="config">
            <Cog className="mr-2" /> Configuration
          </TabsTrigger>
        </TabsList>
        <TabsContent value="responses">
          <ResponsesTab />
        </TabsContent>
        <TabsContent value="config">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdventurerDashboard;
