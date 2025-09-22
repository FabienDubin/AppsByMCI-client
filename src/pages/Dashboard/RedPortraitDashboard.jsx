import React from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette, Cog, Images, SquareArrowOutUpRight } from "lucide-react";

import ConfigTab from "@/components/RedPortrait/ConfigTab";
import ResponsesTab from "@/components/RedPortrait/ResponsesTab";

const RedPortraitDashboard = () => {
  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Dashboard - Red Portrait</title>
        <meta
          name="description"
          content="Gérez les portraits Rouge & Noir et la configuration"
        />
      </Helmet>

      <div className="flex justify-between items-center">
        <h1 className="flex items-center text-2xl font-bold p-4 w-full">
          <Palette className="mr-2 text-red-500" />
          Red Portrait
        </h1>
        <Button
          variant="ghost"
          onClick={() => window.open("/clarins", "_blank")}
        >
          Go to the app <SquareArrowOutUpRight />
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.open("/clarins/screen", "_blank")}
        >
          Open screen <SquareArrowOutUpRight />
        </Button>
      </div>

      <Tabs defaultValue="responses" className="w-full">
        <TabsList>
          <TabsTrigger value="responses">
            <Images className="mr-2" /> Portraits
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

export default RedPortraitDashboard;
