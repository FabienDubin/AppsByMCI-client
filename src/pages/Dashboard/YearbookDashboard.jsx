import React from "react";

//COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//MEDIAS
import { BookOpen, Cog, MessageSquareReply } from "lucide-react";
import ConfigTab from "@/components/Yearbook/ConfigTab";
import ResponsesTab from "@/components/Yearbook/ResponsesTab";

const YearbookDashboard = () => {
  return (
    <div className="w-full min-h-screen">
      <h1 className="flex items-center text-2xl font-bold p-4 w-full">
        <BookOpen className="mr-2" />
        Yearbook
      </h1>
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
