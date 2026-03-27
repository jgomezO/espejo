import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ReflectionProvider } from "./context/ReflectionContext.jsx";
import { UserProvider, useUserContext } from "./context/UserContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import Home from "./pages/Home.jsx";
import Reflect from "./pages/Reflect.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import ReflectionChat from "./pages/ReflectionChat.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import OnboardingConsent from "./components/onboarding/OnboardingConsent.jsx";

function LoadingScreen() {
  return (
    <div className="app-loading">
      <div className="app-loading-icon"><Sparkles size={48} strokeWidth={1.5} /></div>
    </div>
  );
}

function ProtectedApp() {
  const { user } = useAuth();
  const { state, dispatch, initialized } = useUserContext();

  if (user === undefined || (user && !initialized)) {
    return <LoadingScreen />;
  }

  if (user === null) {
    return <LoginScreen />;
  }

  if (!state.onboardingCompleted) {
    return (
      <OnboardingConsent
        onComplete={() => dispatch({ type: "COMPLETE_ONBOARDING" })}
      />
    );
  }

  return (
    <ReflectionProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/reflect" element={<Reflect />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reflection/:id/chat" element={<ReflectionChat />} />
        </Route>
      </Routes>
    </ReflectionProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HeroUIProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </HeroUIProvider>
  );
}
