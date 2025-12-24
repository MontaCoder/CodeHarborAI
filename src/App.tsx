import { lazy, Suspense, useState } from 'react';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import { ThemeProvider } from './context/ThemeContext';

const MainApp = lazy(() => import('./components/MainApp'));

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300 flex flex-col font-sans">
        <div className="flex-grow">
          {showApp ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-24 text-neutral-500 dark:text-neutral-400">
                  Loading workspace...
                </div>
              }
            >
              <MainApp />
            </Suspense>
          ) : (
            <LandingPage onGetStarted={() => setShowApp(true)} />
          )}
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
