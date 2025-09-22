import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api, GenerateTestResponse } from '@/lib/api';
import { LogOut, User, BookOpen, FileText, Loader2, CheckCircle } from 'lucide-react';
import { TestDisplay } from './TestDisplay';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState<GenerateTestResponse | null>(null);

  const handleGenerateTest = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const testData = await api.generateTest(user.id);
      setGeneratedTest(testData);
      toast({
        title: 'Test Generated Successfully!',
        description: 'Your personalized test is ready.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate test',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewTest = () => {
    setGeneratedTest(null);
  };

  if (generatedTest) {
    return <TestDisplay testData={generatedTest} onNewTest={handleNewTest} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">EduPlatform</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to generate your personalized assessment? Our platform creates tailored tests 
              based on your role and learning objectives.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {user?.role === 'TVET' ? 'Technical & Vocational Education' : 'Administrative Officer'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-2xl font-bold text-foreground">Active</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-foreground truncate">
                  {user?.email}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Generation Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Generate Your Test</CardTitle>
              <CardDescription className="text-base max-w-md mx-auto">
                Create a personalized assessment tailored to your role and expertise level.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleGenerateTest}
                disabled={isGenerating}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating Test...
                  </>
                ) : (
                  <>
                    <FileText className="mr-3 h-5 w-5" />
                    Generate New Test
                  </>
                )}
              </Button>
              
              {isGenerating && (
                <p className="text-sm text-muted-foreground mt-4">
                  This may take a few moments while we create your personalized assessment...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};