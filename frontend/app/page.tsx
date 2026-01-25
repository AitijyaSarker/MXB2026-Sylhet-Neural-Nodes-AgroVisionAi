'use client'

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Hero } from '../components/common/Hero';
import FarmerDashboard from '../components/farmer/FarmerDashboard';
import { SpecialistDashboard } from '../components/specialist/SpecialistDashboard';
import { About } from '../components/common/About';
import { Datasets } from '../components/common/Datasets';
import { Contact } from '../components/common/Contact';
import { Footer } from '../components/common/Footer';
import { Register } from '../components/Register';
import { Login } from '../components/Login';
import { LanguageProvider, useTranslation } from '../src/hooks/useTranslation';
import { UserRole } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';

function HomeContent() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'dashboard' | 'datasets' | 'about' | 'contact'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { lang, setLang } = useTranslation();

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('agrovision-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setUserRole(userData.role || 'farmer');
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setUserRole(userData.role || 'farmer');
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole('guest');
    setCurrentPage('home');
    localStorage.removeItem('user');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('agrovision-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div>
            <Hero onGetStarted={() => setCurrentPage('register')} lang={lang} />
            <About />
            <Datasets />
            <Contact />
          </div>
        );
      case 'login':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-6">
            <Login
              lang={lang}
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentPage('register')}
            />
          </div>
        );
      case 'register':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-6">
            <Register
              lang={lang}
              onRegisterSuccess={handleLoginSuccess}
              onSwitchToLogin={() => setCurrentPage('login')}
            />
          </div>
        );
      case 'dashboard':
        return userRole === 'specialist'
          ? <SpecialistDashboard userId={user?.id} lang={lang} />
          : <FarmerDashboard userRole={userRole} userId={user?.id} user={user} lang={lang} />;
      case 'datasets':
        return <Datasets />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <div>
            <Hero onGetStarted={() => setCurrentPage('register')} lang={lang} />
            <About />
            <Datasets />
            <Contact />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <Navbar
        theme={theme}
        currentPage={currentPage}
        userRole={userRole}
        onPageChange={(page) => setCurrentPage(page as typeof currentPage)}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
        lang={lang}
        onLangChange={setLang}
      />
      <main className="pt-16 min-h-[calc(100vh-80px)]">
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>
      <Footer lang={lang} />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}