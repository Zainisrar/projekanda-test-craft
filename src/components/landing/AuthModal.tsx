import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api, SignupData, SigninData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeInput, isValidEmail } from '@/lib/utils';
import { Loader2, GraduationCap, X } from 'lucide-react';

const TVET_INTEREST_FIELDS = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'business', label: 'Business' },
] as const;

export interface AuthModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onModeChange,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as 'TVET' | 'ADOF' | '',
    interested_field: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleMode = () => {
    onModeChange(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const sanitizedName = sanitizeInput(formData.name);
        const sanitizedEmail = sanitizeInput(formData.email);
        
        if (!sanitizedName || !sanitizedEmail || !formData.password || !formData.role) {
          throw new Error('Please fill in all fields');
        }

        if (!isValidEmail(sanitizedEmail)) {
          throw new Error('Please enter a valid email address');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        if (formData.role === 'TVET' && !formData.interested_field) {
          throw new Error('Please select your field of interest');
        }
        
        const signupData: SignupData = {
          name: sanitizedName,
          email: sanitizedEmail,
          password: formData.password,
          role: formData.role,
          ...(formData.role === 'TVET' && formData.interested_field ? { interested_field: formData.interested_field } : {}),
        };
        
        await api.signup(signupData);
        
        if (formData.role === 'TVET' && formData.interested_field) {
          localStorage.setItem('interested_field', formData.interested_field);
        }
        
        toast({
          title: 'Account created successfully!',
          description: 'Please sign in with your credentials.',
        });
        
        setFormData({
          name: '',
          email: '',
          password: '',
          role: '' as 'TVET' | 'ADOF' | '',
          interested_field: '',
        });
        onModeChange('signin');
      } else {
        const sanitizedEmail = sanitizeInput(formData.email);
        
        if (!sanitizedEmail || !formData.password) {
          throw new Error('Please fill in all fields');
        }

        if (!isValidEmail(sanitizedEmail)) {
          throw new Error('Please enter a valid email address');
        }
        
        const signinData: SigninData = {
          email: sanitizedEmail,
          password: formData.password,
        };
        
        const response = await api.signin(signinData);
        
        const userData = response.user || {
          id: response.id || Date.now().toString(),
          name: response.name || 'User',
          email: formData.email,
          role: response.role || 'TVET',
        };
        
        login(userData);
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</DialogTitle>
        </VisuallyHidden>
        
        <Card className="w-full relative bg-card/95 backdrop-blur-sm border border-border/50">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {mode === 'signin' 
                  ? 'Sign in to your account to continue' 
                  : 'Join our educational platform today'
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="modal-name" className="text-foreground">Full Name</Label>
                  <Input
                    id="modal-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-input/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="modal-email" className="text-foreground">Email</Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modal-password" className="text-foreground">Password</Label>
                <Input
                  id="modal-password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="modal-role" className="text-foreground">Role</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)} value={formData.role}>
                    <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TVET">TVET (Technical & Vocational Education)</SelectItem>
                      <SelectItem value="ADOF">ADOF (Administrative Officer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {mode === 'signup' && formData.role === 'TVET' && (
                <div className="space-y-2">
                  <Label htmlFor="modal-interest" className="text-foreground">Field of Interest</Label>
                  <Select onValueChange={(value) => handleInputChange('interested_field', value)} value={formData.interested_field}>
                    <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary">
                      <SelectValue placeholder="Select your field of interest" />
                    </SelectTrigger>
                    <SelectContent>
                      {TVET_INTEREST_FIELDS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
