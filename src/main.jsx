import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProviderWrapper } from "@/context/auth.context";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProviderWrapper>
          <App />
        </AuthProviderWrapper>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
