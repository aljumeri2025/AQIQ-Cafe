
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { StoryPage } from './pages/StoryPage';
import { DrinksMenuPage } from './pages/DrinksMenuPage';
import { DessertsMenuPage } from './pages/DessertsMenuPage';
import { FridayGatheringPage } from './pages/FridayGatheringPage';
import { ContactPage } from './pages/ContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { LanguageProvider } from './contexts/LanguageContext';
import * as DB from './services/db';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('aqiq_admin_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  
  // Run automated engine checks every minute
  useEffect(() => {
    const interval = setInterval(() => {
      DB.runAutomatedChecks();
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  return (
    <LanguageProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/menu/drinks" element={<DrinksMenuPage />} />
            <Route path="/menu/desserts" element={<DessertsMenuPage />} />
            <Route path="/friday-gathering" element={<FridayGatheringPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
