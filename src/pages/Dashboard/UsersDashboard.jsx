import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";
import { Helmet } from "react-helmet";
//COMPONENTS
import UserTable from "@/components/UserTable/UserTable";

//MEDIAS
import { SquareUserRound } from "lucide-react";

const UsersDashboard = () => {
  //CONTEXT
  const { user } = useContext(AuthContext);

  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Dashboard - Users</title>
      </Helmet>
      <h1 className="flex items-center text-2xl font-bold p-4 w-full">
        <SquareUserRound className="mr-2" />
        Users
      </h1>
      <UserTable />
    </div>
  );
};

export default UsersDashboard;
