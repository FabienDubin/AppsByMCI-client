import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";
import { Helmet } from "react-helmet-async";

//COMPONENTS
import LinksTable from "@/components/LinksTable/LinksTable";

//MEDIAS
import { Link2 } from "lucide-react";

const LinksDashboard = () => {
  //CONTEXT
  const { user } = useContext(AuthContext);

  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Dashboard - Links</title>
      </Helmet>
      <h1 className="flex items-center text-2xl font-bold p-4 w-full">
        <Link2 className="mr-2" />
        Gestionnaire de liens
      </h1>
      <LinksTable />
    </div>
  );
};

export default LinksDashboard;