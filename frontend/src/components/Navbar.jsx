import React from 'react';
import { Sun, Moon, Database, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ dbType }) => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle placeholder */}
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white sm:block hidden">
          Library Management System
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Database connectivity badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          dbType === 'mysql' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
        }`}>
          <Database className="h-3.5 w-3.5" />
          <span>DB: {dbType === 'mysql' ? 'MySQL Connected' : 'Mock Mode (Fallback)'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-650" />}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-850 pl-4">
          <div className="h-8 w-8 rounded-full bg-library-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Administrator</p>
            <p className="text-[10px] text-slate-500">System Manager</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
