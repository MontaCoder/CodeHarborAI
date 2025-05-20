import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col">
        <div className="flex-grow">
          {showApp ? (
            <MainApp />
          ) : (
            <LandingPage onGetStarted={() => setShowApp(true)} />
          )}
        </div>
        <footer className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Montassar Hajri. All rights reserved.
          </p>
          <p>
            <a href="https://github.com/MontaCoder" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              GitHub: MontaCoder
            </a>
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;