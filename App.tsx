import React, { useEffect, createContext, useState, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Scheduler from './pages/Scheduler';
import BlogPost from './pages/BlogPost';
import { seedInitialData } from './services/storageService';

// Theme Context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize DB
    seedInitialData();
    
    // Load theme preference
    const savedTheme = localStorage.getItem('nebula_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nebula_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nebula_theme', 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<BlogPost />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeContext.Provider>
  );
};

export default App;