import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import { ThemeProvider } from './context/ThemeContext';

const MainApp = lazy(() => import('./components/MainApp'));

function WorkspaceFallback() {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-5"
      role="status"
      aria-live="polite"
    >
      <img
        src="/codeharborai_logo.svg"
        alt=""
        className="h-12 w-12 motion-safe:animate-pulse"
      />
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Preparing your workspace
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Loading the local-first tools…
        </p>
      </div>
    </div>
  );
}

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <ThemeProvider>
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col bg-stone-50 font-sans transition-colors duration-300 dark:bg-neutral-950">
        <div className="flex-grow">
          {showApp ? (
            <ErrorBoundary>
              <Suspense fallback={<WorkspaceFallback />}>
                <MainApp onBackToLanding={() => setShowApp(false)} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <LandingPage onGetStarted={() => setShowApp(true)} />
          )}
        </div>
        <Footer compact={showApp} />
      </div>
    </ThemeProvider>
  );
}

export default App;
