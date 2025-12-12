import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <Navigation />
      <div className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;