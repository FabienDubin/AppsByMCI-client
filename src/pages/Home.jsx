import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BackgroundPath } from "@/components/BackgroundPath";
const Home = () => {
  //CONTEXT
  const { user } = useContext(AuthContext);

  //NAVIGATION
  const nav = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center">
      <BackgroundPath title="Welcome to AppsByMCI" user={user} />
    </div>
  );
};

export default Home;
