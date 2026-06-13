import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
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
