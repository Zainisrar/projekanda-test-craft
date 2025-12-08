import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/landing/LandingPage';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to their appropriate dashboard
  if (user) {
    const rolePathMap: Record<string, string> = {
      'ADMIN': '/admin/dashboard',
      'ADOF': '/adof',
      'TVET': '/dashboard',
    };
    const redirectPath = rolePathMap[user.role] || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
};

export default Index;
