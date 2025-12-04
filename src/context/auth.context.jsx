import React, { useState, useEffect, createContext } from "react";
import authService from "@/services/auth.service";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

function AuthProviderWrapper({ children }) {
  //STATES
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  //NAVIGATION
  const nav = useNavigate();

  //FUNCTIONS
  //Store token in the local storage when the user is authenticated
  const storeToken = (token) => {
    localStorage.setItem("authToken", token);
  };

  // Verify the token and update the user state if the token is valid
  // Returns a Promise to allow proper await usage
  const authenticateUser = async () => {
    setIsLoading(true);

    // Get the stored token from the localStorage
    const storedToken = localStorage.getItem("authToken");

    if (!storedToken) {
      setIsLoggedIn(false);
      setIsLoading(false);
      setUser(null);
      return;
    }

    // Timeout to prevent infinite loading (10 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Authentication timeout")), 10000);
    });

    try {
      // Race between the verify call and the timeout
      const response = await Promise.race([
        authService.verify(),
        timeoutPromise,
      ]);

      // If the server verifies that JWT token is valid
      const user = response.data;
      setIsLoggedIn(true);
      setUser(user);
    } catch (error) {
      // If the server sends an error response (invalid token) or timeout
      console.error("Authentication error:", error.message);
      setIsLoggedIn(false);
      setUser(null);
      // Clear invalid token to prevent future issues
      if (error.message === "Authentication timeout") {
        localStorage.removeItem("authToken");
      }
    } finally {
      // Always set loading to false, no matter what happens
      setIsLoading(false);
    }
  };

  const removeToken = () => {
    localStorage.removeItem("authToken");
  };

  const logOutUser = () => {
    // Upon logout, remove the token from the localStorage
    removeToken();
    authenticateUser();
  };

  //When the user is updated, update the user state and localStorage with the new user data.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Si tu stockes l'utilisateur en local
  };

  useEffect(() => {
    // Run this code once the AuthProviderWrapper component in the App loads for the first time.
    // This effect runs when the application and the AuthProviderWrapper component load for the first time.
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        storeToken,
        authenticateUser,
        updateUser,
        logOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProviderWrapper, AuthContext };
