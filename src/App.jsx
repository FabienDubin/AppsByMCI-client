import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";

//COMPONENTS
import { ThemeProvider } from "@/components/ThemeProvider";
import IsAnonymous from "@/components/IsAnonymous";
import IsPrivate from "@/components/IsPrivate";
import IsAdmin from "./components/IsAdmin";
import { Button } from "@/components/ui/button";

//PAGES
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import UsersDashboard from "./pages/Dashboard/UsersDashboard";
import LinksDashboard from "./pages/Dashboard/LinksDashboard";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import Layout from "./components/Sidebar/Layout";
import SettingsDashboard from "./pages/Dashboard/SettingsDashboard";
import RootLayout from "./components/ToastLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

//APP PAGES
import MercedesCLA from "./pages/MercedesCLA";
import MercedesDashboard from "./pages/Dashboard/MercedesDashboard";
import Yearbook from "./pages/Yearbook";
import YearbookDashboard from "./pages/Dashboard/YearbookDashboard";
import AdventurerProfile from "./pages/AdventurerProfile";
import AdventurerDashboard from "./pages/Dashboard/AdventurerDashboard";
import AstronautProfile from "./pages/AstronautProfile";
import AstronautDashboard from "./pages/Dashboard/AstronautDashboard";
import EventManagerProfile from "./pages/EventManagerProfile";
import EventManagerDashboard from "./pages/Dashboard/EventManagerDashboard";
import EventManagerScreen from "./pages/EventManagerScreen";
import LinkResolver from "./components/LinkResolver";
import TestCalendar from "./pages/TestCalendar";

function App() {
  //LOCATION
  const location = useLocation();
  //remove the navbar on the signup the login a,d the dashboard page
  const noNavbarRoutes = [
    "/login",
    "/signup",
    "/mercedesCLA",
    "/yearbook",
    "/adventurer",
    "/astronaut",
    "/eventmanager",
    "/eventmanager/screen",
  ];
  const hideNavbar =
    noNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/links/");

  return (
    <>
      <ThemeProvider>
        {!hideNavbar && <Navbar />}

        <RootLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <IsAnonymous>
                  <Login />
                </IsAnonymous>
              }
            />
            <Route
              path="/reset-password"
              element={
                <IsAnonymous>
                  <ForgotPassword />
                </IsAnonymous>
              }
            />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* ------- Signup page closed ----------- */}
            {/* ------- If open, display the signup button in the nav bar----------- */}
            {/* <Route
              path="/signup"
              element={
                <IsAnonymous>
                  <Signup />
                </IsAnonymous>
              }
            /> */}
            <Route
              path="/dashboard/*"
              element={
                <IsPrivate>
                  <IsAdmin>
                    <Layout>
                      <Routes>
                        {/* Here are all the pages of the admin dashboard */}
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="users" element={<UsersDashboard />} />
                        <Route path="links" element={<LinksDashboard />} />
                        <Route
                          path="mercedes"
                          element={<MercedesDashboard />}
                        />
                        <Route
                          path="yearbook"
                          element={<YearbookDashboard />}
                        />
                        <Route
                          path="adventurer"
                          element={<AdventurerDashboard />}
                        />
                        <Route
                          path="astronaut"
                          element={<AstronautDashboard />}
                        />
                        <Route
                          path="eventmanager"
                          element={<EventManagerDashboard />}
                        />
                        <Route
                          path="settings"
                          element={<SettingsDashboard />}
                        />
                      </Routes>
                    </Layout>
                  </IsAdmin>
                </IsPrivate>
              }
            />
            <Route
              path="/profile"
              element={
                <IsPrivate>
                  <Profile />
                </IsPrivate>
              }
            />

            {/* Page to mercedesCLA app */}
            <Route path="/mercedesCLA" element={<MercedesCLA />} />

            {/* Page to mercedesCLA app */}
            <Route path="/calendartest" element={<TestCalendar />} />

            {/* Page to yearbook app */}
            <Route path="/yearbook" element={<Yearbook />} />

            {/* Page to adventurer profile app */}
            <Route path="/adventurer" element={<AdventurerProfile />} />

            {/* Page to astronaut profile app */}
            <Route path="/astronaut" element={<AstronautProfile />} />

            {/* Page to event manager profile app */}
            <Route path="/eventmanager" element={<EventManagerProfile />} />

            {/* Page to event manager screen for events */}
            <Route
              path="/eventmanager/screen"
              element={<EventManagerScreen />}
            />

            {/* Public link resolver */}
            <Route path="/links/:slug" element={<LinkResolver />} />

            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RootLayout>
      </ThemeProvider>
    </>
  );
}

export default App;
