import React from "react";

//COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
//MEDIAS
import {
  CarFront,
  Cog,
  MessageSquareReply,
  SquareArrowOutUpRight,
} from "lucide-react";
import ConfigTab from "@/components/CLA/ConfigTab";
import ResponsesTab from "@/components/CLA/ResponsesTab";
import { useNavigate } from "react-router-dom";
const MercedesDashboard = () => {
  return (
    <div className="w-full min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="flex items-center text-2xl font-bold p-4 w-full">
          <CarFront className="mr-2" />
          Mercedes CLA
        </h1>
        <Button
          variant="ghost"
          onClick={() => window.open("/mercedesCLA", "_blank  ")}
        >
          Go to the app <SquareArrowOutUpRight />
        </Button>
      </div>

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
