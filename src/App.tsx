import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {showApp ? (
          <MainApp />
        ) : (
          <LandingPage onGetStarted={() => setShowApp(true)} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;