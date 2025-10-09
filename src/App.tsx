import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';
import Footer from './components/Footer';

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300 flex flex-col font-sans">
        <div className="flex-grow">
          {showApp ? (
            <MainApp />
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