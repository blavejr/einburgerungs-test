import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toast } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SessionProvider } from "@/context/SessionContext";
import { ToastProvider } from "@/context/ToastContext";
import { BrowsePage } from "@/pages/BrowsePage";
import { CardsPage } from "@/pages/CardsPage";
import { CardsSessionPage } from "@/pages/CardsSessionPage";
import { HomePage } from "@/pages/HomePage";
import { LearnPage } from "@/pages/LearnPage";
import { LearnSessionPage } from "@/pages/LearnSessionPage";
import { MapPage } from "@/pages/MapPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TestPage } from "@/pages/TestPage";
import { TestResultPage } from "@/pages/TestResultPage";
import { TestRunPage } from "@/pages/TestRunPage";
import { VocabPage } from "@/pages/VocabPage";
import { VocabSessionPage } from "@/pages/VocabSessionPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function AppShell() {
  return (
    <>
      <ScrollToTop />
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/session" element={<LearnSessionPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/cards/session" element={<CardsSessionPage />} />
          <Route path="/vocab" element={<VocabPage />} />
          <Route path="/vocab/session" element={<VocabSessionPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/test/run" element={<TestRunPage />} />
          <Route path="/test/result" element={<TestResultPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProgressProvider>
            <SessionProvider>
              <AppShell />
            </SessionProvider>
          </ProgressProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
