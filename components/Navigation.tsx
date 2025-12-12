import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, PenTool, Calendar, Moon, Sun } from 'lucide-react';
import { useTheme } from '../App';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PenTool, label: 'Write / AI', path: '/editor' },
    { icon: Calendar, label: 'Scheduler', path: '/scheduler' },
  ];

  return (
    <nav className="w-20 lg:w-64 bg-slate-900 dark:bg-slate-950 text-white min-h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50 border-r border-slate-800">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/20">
          <span className="font-bold text-lg text-white">N</span>
        </div>
        <span className="font-bold text-xl hidden lg:block tracking-tight">Nebula</span>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} className="group-hover:scale-105 transition-transform" />
            <span className="hidden lg:block font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
         <button 
           onClick={toggleTheme}
           className="flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all w-full"
         >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="hidden lg:block font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
         </button>
         
         <div className="text-xs text-slate-600 text-center lg:text-left hidden lg:block px-2">
            &copy; 2024 NebulaBlog
         </div>
      </div>
    </nav>
  );
};

export default Navigation;