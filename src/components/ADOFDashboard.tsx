import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { SubmitTestResultResponse } from '@/lib/api';
import { LogOut, User, BookOpen, Briefcase, FileText, ClipboardCheck, BarChart3, Home, Brain } from 'lucide-react';
import { JobSelection } from './adof/JobSelection';
import { CVCollection } from './adof/CVCollection';
import { ADOFTestDisplay } from './adof/ADOFTestDisplay';
import { ADOFReports } from './adof/ADOFReports';

type ADOFStep = 'jobs' | 'cv' | 'academic-test' | 'personality-test' | 'report';

interface SelectedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  test_ids?: string[];
}

interface CVData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  education: string;
  file?: File;
}

export const ADOFDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ADOFStep>('jobs');
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [academicTestResults, setAcademicTestResults] = useState<SubmitTestResultResponse | null>(null);
  const [personalityTestResults, setPersonalityTestResults] = useState<SubmitTestResultResponse | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleJobSelect = (job: SelectedJob) => {
    setSelectedJob(job);
    setCurrentStep('cv');
  };

  const handleCVSubmit = (data: CVData) => {
    setCvData(data);
    setCurrentStep('academic-test');
  };

  const handleAcademicTestComplete = (results: SubmitTestResultResponse) => {
    setAcademicTestResults(results);
    setCurrentStep('personality-test');
  };

  const handlePersonalityTestComplete = async (results: SubmitTestResultResponse) => {
    setPersonalityTestResults(results);
    setIsGeneratingReport(true);
    
    // Brief delay to show "Generating Report" state for better UX
    setTimeout(() => {
      setIsGeneratingReport(false);
      setCurrentStep('report');
    }, 1500);
  };

  const handleBackToJobs = () => {
    setCurrentStep('jobs');
    setSelectedJob(null);
    setCvData(null);
    setAcademicTestResults(null);
    setPersonalityTestResults(null);
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'jobs' as ADOFStep, label: 'Select Job', icon: Briefcase },
      { key: 'cv' as ADOFStep, label: 'Submit CV', icon: FileText },
      { key: 'academic-test' as ADOFStep, label: 'Academic Test', icon: BookOpen },
      { key: 'personality-test' as ADOFStep, label: 'Personality Test', icon: Brain },
      { key: 'report' as ADOFStep, label: 'View Report', icon: BarChart3 },
    ];

    return (
      <div className="flex justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 md:space-x-4 px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = 
              (step.key === 'jobs' && selectedJob) ||
              (step.key === 'cv' && cvData) ||
              (step.key === 'academic-test' && academicTestResults) ||
              (step.key === 'personality-test' && personalityTestResults) ||
              (step.key === 'report' && academicTestResults && personalityTestResults);
            
            return (
              <div key={step.key} className="flex items-center flex-shrink-0">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  isCompleted 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
                    : isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-4 md:w-8 h-px bg-border mx-1 md:mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    // Show generating report state
    if (isGeneratingReport) {
      return (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <BarChart3 className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Generating Your Report</h3>
                  <p className="text-muted-foreground max-w-md">
                    Analyzing your assessment results and generating comprehensive insights...
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (currentStep) {
      case 'jobs':
        return <JobSelection onJobSelect={handleJobSelect} />;
      case 'cv':
        return (
          <CVCollection 
            selectedJob={selectedJob!} 
            onCVSubmit={handleCVSubmit}
            onBack={() => setCurrentStep('jobs')}
          />
        );
      case 'academic-test':
        return (
          <ADOFTestDisplay 
            selectedJob={selectedJob!}
            cvData={cvData!}
            userId={user?.id || ''}
            testType="academic"
            onTestComplete={handleAcademicTestComplete}
            onBack={() => setCurrentStep('cv')}
          />
        );
      case 'personality-test':
        return (
          <ADOFTestDisplay 
            selectedJob={selectedJob!}
            cvData={cvData!}
            userId={user?.id || ''}
            testType="personality"
            onTestComplete={handlePersonalityTestComplete}
            onBack={() => setCurrentStep('academic-test')}
          />
        );
      case 'report':
        return (
          <ADOFReports 
            selectedJob={selectedJob!}
            cvData={cvData!}
            academicTestResults={academicTestResults}
            personalityTestResults={personalityTestResults}
            onBackToJobs={handleBackToJobs}
          />
        );
      default:
        return <JobSelection onJobSelect={handleJobSelect} />;
    }
  };

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
              <h1 className="text-xl font-bold text-foreground">JobFinder - ADOF</h1>
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
                onClick={handleLogout}
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
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              ADOF Assessment Portal
            </h2>
            <p className="text-muted-foreground">
              Adult Development and Occupational Framework - Complete your job assessment
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Current Step Content */}
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
};