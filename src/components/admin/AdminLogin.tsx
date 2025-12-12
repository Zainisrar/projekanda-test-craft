import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api, SigninData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is already logged in as ADMIN, redirect to dashboard
  if (user && user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is logged in but not ADMIN, redirect to home
  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // ADMIN CREDENTIALS - Works in both development and production
      if (formData.email === 'admin@gmail.com' && formData.password === '123') {
        const adminUser = {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@gmail.com',
          role: 'ADMIN' as const,
        };

        login(adminUser);
        toast({
          title: 'Admin Access Granted',
          description: 'Successfully signed in as administrator.',
        });
        return;
      }

      // REAL API CALL (for production)
      const signinData: SigninData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await api.signin(signinData);

      // Handle the API response format: { message: "Login successful", user: {...} }
      const userData = response.user || {
        id: response.id || Date.now().toString(),
        name: response.name || 'User',
        email: formData.email,
        role: response.role || 'TVET',
      };

      // CRITICAL: Verify user has ADMIN role
      if (userData.role !== 'ADMIN') {
        toast({
          title: 'Access Denied',
          description: 'Admin privileges required.',
          variant: 'destructive',
        });
        return;
      }

      // Only proceed if user is ADMIN
      login(userData);
      toast({
        title: 'Admin Access Granted',
        description: 'Successfully signed in as administrator.',
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/logo.jpeg" alt="Fit Finder" className="h-14 w-auto object-contain rounded-lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Admin Access
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sign in with administrator credentials
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In as Admin'
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              This is a restricted access area
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
