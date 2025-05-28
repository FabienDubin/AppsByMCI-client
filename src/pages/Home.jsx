import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  //CONTEXT
  const { user } = useContext(AuthContext);

  //NAVIGATION
  const nav = useNavigate();

  return (
    <div className="h-screen flex items-center">
      <h1 className="text-9xl font-bold mx-4 my-8 drop-shadow-xl">
        Welcome to the home page
      </h1>
      {user && (
        <Button onClick={() => nav("/mercedesCLA")}>Mercedes CLA</Button>
      )}
    </div>
  );
};

export default Home;
