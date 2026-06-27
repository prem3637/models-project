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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-950/20 border border-accent-200 dark:border-accent-800/45 text-accent-600 dark:text-accent-400 mb-3 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">PIZLIO MODELS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Agency Management Portal</p>
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
