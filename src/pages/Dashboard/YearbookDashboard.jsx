import React from "react";
import { Helmet } from "react-helmet-async";
//COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//MEDIAS
import {
  BookOpen,
  Cog,
  MessageSquareReply,
  SquareArrowOutUpRight,
} from "lucide-react";
import ConfigTab from "@/components/Yearbook/ConfigTab";
import ResponsesTab from "@/components/Yearbook/ResponsesTab";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const YearbookDashboard = () => {
  const nav = useNavigate();
  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Dashboard - Yearbook</title>
        <meta
          name="description"
          content="Consultez les soumissions du yearbook."
        />
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="flex items-center text-2xl font-bold p-4 w-full">
          <BookOpen className="mr-2" />
          Yearbook
        </h1>
        <Button
          variant="ghost"
          onClick={() => window.open("/yearbook", "_blank")}
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

export default YearbookDashboard;
