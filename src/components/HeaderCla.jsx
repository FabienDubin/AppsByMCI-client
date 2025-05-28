import React from "react";
import headerImage from "@/assets/header.png";

const HeaderCla = () => {
  return (
    <img
      src={headerImage}
      alt="Header"
      className="w-full m-h-screen object-cover"
    />
  );
};

export default HeaderCla;
