import { ArrowRight, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackdrop from './landing/AnimatedBackdrop';
import ContextHighlights from './landing/ContextHighlights';
import HeroSection from './landing/HeroSection';
import LandingHeader from './landing/LandingHeader';
import PreviewCard from './landing/PreviewCard';
import WorkflowSteps from './landing/WorkflowSteps';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col bg-stone-50 dark:bg-neutral-950">
      <AnimatedBackdrop />
      <LandingHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onGetStarted={onGetStarted}
      />

      <main id="main-content" className="relative z-10 flex-1">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:pb-28 lg:pt-24">
          <HeroSection onGetStarted={onGetStarted} />
          <PreviewCard />
        </section>

        <WorkflowSteps />
        <ContextHighlights />

        <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-16 text-center shadow-lift sm:px-12 dark:border dark:border-neutral-800">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[110px]"
            />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                Ready when you are
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Your next prompt deserves{' '}
                <span className="font-serif italic font-normal text-emerald-300">
                  better context
                </span>
                .
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                No account, no upload, no tracking. Just your code and a prompt
                that finally fits.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-950/30 transition-colors hover:bg-emerald-300 sm:w-auto"
                >
                  Open the workspace
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-4 w-4 text-emerald-400"
                  />
                  Files never leave your device
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
