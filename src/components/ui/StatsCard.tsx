import React from 'react';

export interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  bottomText: string;
  icon: React.ReactNode;
  variant?: 'accent' | 'pink' | 'amber';
}

const variantStyles = {
  accent: {
    cardHover: 'hover:border-accent-500/25 dark:hover:border-accent-500/30',
    iconWrapper: 'bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-800/30',
    bottomText: 'text-accent-600 dark:text-accent-400'
  },
  pink: {
    cardHover: 'hover:border-pink-500/25 dark:hover:border-pink-500/30',
    iconWrapper: 'bg-pink-50 dark:bg-pink-955/30 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800/30',
    bottomText: 'text-pink-500 dark:text-pink-400'
  },
  amber: {
    cardHover: 'hover:border-amber-500/25 dark:hover:border-amber-500/30',
    iconWrapper: 'bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30',
    bottomText: 'text-amber-600 dark:text-amber-400'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  bottomText,
  icon,
  variant = 'accent'
}) => {
  const styles = variantStyles[variant] || variantStyles.accent;

  return (
    <div className={`bg-white dark:bg-navy-card border border-slate-205 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm transition-all duration-200 relative overflow-hidden group ${styles.cardHover}`}>
      <div className="flex flex-col gap-1 z-10">
        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-405 uppercase tracking-widest">{title}</span>
        <span className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
          {value}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${styles.bottomText}`}>{bottomText}</span>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${styles.iconWrapper}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
