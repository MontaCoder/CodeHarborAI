import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col font-sans">
        <div className="flex-grow">
          {showApp ? (
            <MainApp />
          ) : (
            <LandingPage onGetStarted={() => setShowApp(true)} />
          )}
        </div>
        <footer className="py-8 px-4 sm:px-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/50">
          <p className="mb-1">
            &copy; {new Date().getFullYear()} Montassar Hajri. All rights reserved.
          </p>
          <p>
            <a href="https://github.com/MontaCoder" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              GitHub: MontaCoder
            </a>
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;