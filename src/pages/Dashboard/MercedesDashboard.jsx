import React from "react";

//COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//MEDIAS
import { CarFront, Cog, MessageSquareReply } from "lucide-react";
import ConfigTab from "@/components/CLA/ConfigTab";
import ResponsesTab from "@/components/CLA/ResponsesTab";
const MercedesDashboard = () => {
  return (
    <div className="w-full min-h-screen">
      <h1 className="flex items-center text-2xl font-bold p-4 w-full">
        <CarFront className="mr-2" />
        Mercedes CLA
      </h1>
      <Tabs defaultValue="responses" className="w-full">
        <TabsList>
          <TabsTrigger value="responses">
            <MessageSquareReply className="mr-2" /> Réponses
          </TabsTrigger>
          <TabsTrigger value="config">
            <Cog className="mr-2" /> Config
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

export default MercedesDashboard;
