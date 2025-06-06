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
    <div className="h-screen flex flex-col items-center">
      <h1 className="text-6xl font-bold mx-4 mt-16 drop-shadow-xl">
        Welcome to the home page
      </h1>
      {user && (
        <div className="flex flex-col m-4 w-56">
          <h1 className="font-semibold text-xl text-center">Choose an app</h1>
          <Button className="m-4 " onClick={() => nav("/mercedesCLA")}>
            Mercedes CLA
          </Button>
          <Button className="m-4" onClick={() => nav("/yearbook")}>
            Yearbook
          </Button>
          <Button className="m-4" onClick={() => nav("/adventurer")}>
            L'aventurier
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
