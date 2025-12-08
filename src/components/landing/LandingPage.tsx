import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { WhoItsForSection } from './WhoItsForSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';

export interface LandingPageState {
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup';
}

export const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Role-based redirect mapping
  const getRoleRedirectPath = (role: string): string => {
    const rolePathMap: Record<string, string> = {
      'TVET': '/dashboard',
      'ADOF': '/adof',
      'ADMIN': '/admin/dashboard'
    };
    return rolePathMap[role] || '/dashboard';
  };

  const handleOpenSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleModeChange = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  // Redirect authenticated users to their dashboard
  if (user) {
    return <Navigate to={getRoleRedirectPath(user.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSignIn={handleOpenSignIn} onSignUp={handleOpenSignUp} />
      
      <main>
        <HeroSection 
          onGetStarted={handleOpenSignUp} 
          onLearnMore={handleLearnMore} 
        />
        <FeaturesSection />
        <HowItWorksSection />
        <WhoItsForSection onGetStarted={handleOpenSignUp} />
        <TestimonialsSection />
        <CTASection onGetStarted={handleOpenSignUp} />
      </main>
      
      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={handleCloseModal}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default LandingPage;
