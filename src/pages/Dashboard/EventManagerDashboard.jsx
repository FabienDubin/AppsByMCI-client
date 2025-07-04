import React from "react";
import { Helmet } from "react-helmet-async";

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PartyPopper,
  Cog,
  MessageSquareReply,
  SquareArrowOutUpRight,
} from "lucide-react";

import ConfigTab from "@/components/EventManager/ConfigTab";
import ResponsesTab from "@/components/EventManager/ResponsesTab";

const EventManagerDashboard = () => {
  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Dashboard - Profil Event Manager</title>
        <meta
          name="description"
          content="Consultez les soumissions des profils Event Manager."
        />
      </Helmet>

      <div className="flex justify-between items-center">
        <h1 className="flex items-center text-2xl font-bold p-4 w-full">
          <PartyPopper className="mr-2" />
          Profil Event Manager
        </h1>
        <Button
          variant="ghost"
          onClick={() => window.open("/eventmanager", "_blank")}
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

export default EventManagerDashboard;
