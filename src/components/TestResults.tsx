import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestResult, api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { safeParseLocalStorage, localStorageValidators } from '@/lib/utils';
import { Trophy, BarChart3, ArrowLeft, RotateCcw } from 'lucide-react';

interface TestResultsProps {
  result: TestResult;
  onNewTest: () => void;
  onBackToDashboard: () => void;
  recommendedCourses?: import('@/lib/api').RecommendCoursesResponse | null;
  recommendedLoading?: boolean;
  recommendedError?: string | null;
}

export const TestResults: React.FC<TestResultsProps> = ({ 
  result, 
  onNewTest, 
  onBackToDashboard 
  , recommendedCourses = null
  , recommendedLoading = false
  , recommendedError = null
}) => {
  const { data } = result;
  const { percentage, total_score, max_score, analysis } = data;
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [localStorageRecommendations, setLocalStorageRecommendations] = useState<import('@/lib/api').RecommendCoursesResponse | null>(null);
  const { toast } = useToast();

  // Load recommendations from localStorage on mount
  useEffect(() => {
    const recommendations = safeParseLocalStorage('recommended_courses', localStorageValidators.recommendCourses);
    if (recommendations) {
      setLocalStorageRecommendations(recommendations);
    }
  }, []);

  // Use props if available, otherwise fall back to localStorage
  const displayRecommendations = recommendedCourses || localStorageRecommendations;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const handleDownloadReport = async () => {
    const resultId = result?.data?.result_id;
    if (!resultId) {
      toast({
        title: 'Report Unavailable',
        description: 'No result ID available for report generation.',
        variant: 'destructive',
      });
      return;
    }
    setIsDownloadingReport(true);
    try {
      const blob = await api.downloadReport(resultId);
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `personality_report_${timestamp}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Report Downloaded', description: 'The PDF was downloaded successfully.' });
    } catch (error: any) {
      console.error('Failed to download report:', error);
      toast({
        title: 'Download Failed',
        description: error?.message || 'Unable to download report.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={getScoreBadgeVariant(percentage)} className="text-sm">
                {percentage}% Score
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Results</h1>
            <p className="text-muted-foreground">Your assessment has been completed successfully</p>
          </div>

          {/* Score Overview */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Overall Score</CardTitle>
              <CardDescription>Your performance summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
                  {percentage}%
                </div>
                <p className="text-muted-foreground">
                  {total_score} out of {max_score} points
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{total_score}/{max_score}</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Section */}
          {Object.keys(analysis).length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Detailed Analysis</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of your strengths and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(analysis).map(([trait, level]) => (
                    <div key={trait} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{trait}</h3>
                        <p className="text-sm text-muted-foreground">Assessment category</p>
                      </div>
                      <Badge 
                        variant={level === 'Strength' ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        {level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {/* Recommended Courses Section */}
          {recommendedLoading && (
            <Card className="mb-8">
              <CardContent>
                <div className="flex items-center justify-center space-x-3 py-6">
                  <div className="w-6 h-6 rounded-full border-4 border-primary animate-spin" />
                  <div className="text-sm text-muted-foreground">Loading recommended courses...</div>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendedError && (
            <Card className="mb-8 border-destructive">
              <CardContent>
                <div className="text-sm text-destructive">{recommendedError}</div>
              </CardContent>
            </Card>
          )}

          {displayRecommendations && displayRecommendations.data && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Recommended Courses</span>
                </CardTitle>
                <CardDescription>
                  Based on your score and interests, here are some suggested courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {displayRecommendations.data.courses.map((course) => (
                    <div key={course.code} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="max-w-[70%]">
                          <h3 className="font-semibold text-foreground">{course.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground ml-4">
                          <div className="font-mono bg-background px-3 py-1 rounded">{course.code}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownloadReport}
              size="lg"
              disabled={isDownloadingReport}
              className="px-8 py-6 text-lg font-medium"
            >
              {isDownloadingReport ? 'Generating Report…' : 'Download Personality Report'}
            </Button>
            <Button
              onClick={onNewTest}
              size="lg"
              className="px-8 py-6 text-lg font-medium"
            >
              <RotateCcw className="mr-3 h-5 w-5" />
              Take Another Test
            </Button>
            
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-medium"
            >
              <ArrowLeft className="mr-3 h-5 w-5" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};