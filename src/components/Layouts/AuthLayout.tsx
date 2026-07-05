import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-50 via-slate-50 to-indigo-50/50 dark:from-navy-950 dark:via-navy-950 dark:to-navy-card/50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background soft glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-400/10 dark:bg-accent-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-400/10 dark:bg-indigo-400/5 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Pizlio Models Logo" className="h-12 object-contain dark:invert select-none" />
        </div>

        {/* Content container */}
        <div className="bg-white/80 dark:bg-navy-card/85 backdrop-blur-md border border-slate-200/80 dark:border-navy-border rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/60 dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
