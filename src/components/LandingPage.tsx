import type React from 'react';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackdrop from './landing/AnimatedBackdrop';
import ContextHighlights from './landing/ContextHighlights';
import HeroSection from './landing/HeroSection';
import LandingHeader from './landing/LandingHeader';
import PreviewCard from './landing/PreviewCard';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackdrop />
      <LandingHeader theme={theme} onToggleTheme={toggleTheme} />

      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-4 sm:px-6 py-12 md:py-20">
        <div className="w-full max-w-xl space-y-12">
          <HeroSection onGetStarted={onGetStarted} />
          <ContextHighlights />
        </div>
        <PreviewCard />
      </main>
    </div>
  );
};

export default LandingPage;
