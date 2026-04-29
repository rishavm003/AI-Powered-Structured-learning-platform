import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { StorageWarning } from './components/StorageWarning';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { ConfigPage } from './pages/ConfigPage';
import { DashboardPage } from './pages/DashboardPage';
import { DayViewPage } from './pages/DayViewPage';
import { QuizResultsPage } from './pages/QuizResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useRoadmapStore } from './store/roadmapStore';
import { usePrefsStore } from './store/prefsStore';
import { loadSharedURL } from './utils/share';

/** Inner app — has access to router context */
const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const { roadmap, setRoadmap, setConfig } = useRoadmapStore();
  const { theme, onboardingDone } = usePrefsStore();
  const hasRoadmap = roadmap && roadmap.length > 0;

  // Dark mode — watch theme and apply to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load shared URL on first mount
  useEffect(() => {
    const shared = loadSharedURL();
    if (shared) {
      setConfig(shared.config);
      setRoadmap(shared.roadmap as any);
      // Remove the ?shared= param from the URL without reload
      window.history.replaceState({}, '', '/');
      navigate('/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <OfflineBanner />
      <StorageWarning />
      <Navbar />

      {!onboardingDone && <OnboardingModal />}

      <main className="pb-16">
        <Routes>
          <Route path="/" element={hasRoadmap ? <Navigate to="/dashboard" /> : <ConfigPage />} />
          <Route path="/setup" element={<ConfigPage />} />
          <Route path="/dashboard" element={hasRoadmap ? <DashboardPage /> : <Navigate to="/" />} />
          <Route path="/day/:dayNumber" element={hasRoadmap ? <DayViewPage /> : <Navigate to="/" />} />
          <Route path="/quiz-results" element={hasRoadmap ? <QuizResultsPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
