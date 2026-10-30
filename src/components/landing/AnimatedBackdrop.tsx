import type React from 'react';

const AnimatedBackdrop: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black_35%,transparent_100%)] dark:opacity-40" />
      <div className="absolute -top-48 left-1/2 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-emerald-300/25 blur-[130px] dark:bg-emerald-500/10" />
      <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-sky-300/20 blur-[120px] dark:bg-sky-500/10" />
      <div className="absolute -left-32 bottom-0 h-[24rem] w-[32rem] rounded-full bg-violet-300/15 blur-[120px] dark:bg-violet-500/10" />
    </div>
  );
};

export default AnimatedBackdrop;
