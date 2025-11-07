import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SubmitTestResultResponse, api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  BarChart3, 
  ArrowLeft, 
  RotateCcw, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  GraduationCap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  FileText,
  Download,
  Loader2
} from 'lucide-react';

interface SelectedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
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

interface ADOFReportsProps {
  selectedJob: SelectedJob;
  cvData: CVData;
  academicTestResults: SubmitTestResultResponse | null;
  personalityTestResults: SubmitTestResultResponse | null;
  onBackToJobs: () => void;
}

export const ADOFReports: React.FC<ADOFReportsProps> = ({ 
  selectedJob, 
  cvData, 
  academicTestResults, 
  personalityTestResults,
  onBackToJobs 
}) => {
  // Calculate combined score from both tests
  const academicPercentage = academicTestResults?.data?.percentage || 0;
  const personalityPercentage = personalityTestResults?.data?.percentage || 0;
  const percentage = (academicPercentage + personalityPercentage) / 2;
  
  // For compatibility with the existing UI, create a combined data structure
  const data = {
    percentage,
    total_score: 0,
    max_score: 0,
    analysis: {} as Record<string, string>,
  };
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const { toast } = useToast();

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

  const getRecommendation = (percentage: number) => {
    if (percentage >= 80) {
      return {
        status: 'Highly Recommended',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Excellent fit for this position with strong alignment across key competencies.'
      };
    } else if (percentage >= 60) {
      return {
        status: 'Recommended with Development',
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Good potential with some areas for development and training.'
      };
    } else {
      return {
        status: 'Not Recommended',
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Significant gaps identified that may require extensive development.'
      };
    }
  };

  const recommendation = getRecommendation(percentage);
  const RecommendationIcon = recommendation.icon;

  // Calculate skill match
  const skillMatch = cvData.skills.filter(skill => 
    selectedJob.skills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  const skillMatchPercentage = selectedJob.skills.length > 0 
    ? Math.round((skillMatch.length / selectedJob.skills.length) * 100)
    : 0;

  const handleDownloadReport = async () => {
    // For now, we'll use the personality test result ID
    // In a future update, this could generate a combined report
    const resultId = personalityTestResults?.data?.result_id || academicTestResults?.data?.result_id;
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
      const filename = `adof_assessment_report_${timestamp}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ 
        title: 'Report Downloaded', 
        description: 'The ADOF assessment report was downloaded successfully.' 
      });
    } catch (error: any) {
      console.error('Report download failed:', error);
      toast({ 
        title: 'Download Failed', 
        description: error?.message || 'Unable to download report.', 
        variant: 'destructive' 
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Trophy className="w-6 h-6" />
            <span>ADOF Assessment Report</span>
          </CardTitle>
          <CardDescription className="text-base">
            Comprehensive evaluation results for job fit assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Candidate Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{cvData.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{cvData.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{cvData.phone}</span>
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Position Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{selectedJob.title}</div>
                <div className="text-muted-foreground">{selectedJob.company}</div>
                <div className="text-xs text-muted-foreground">
                  Assessment Date: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className={`${recommendation.bgColor} ${recommendation.borderColor} border-2`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <RecommendationIcon className={`w-6 h-6 ${recommendation.color}`} />
            <span>Overall Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
              {percentage}%
            </div>
            <Badge variant={getScoreBadgeVariant(percentage)} className="text-lg px-4 py-2 mb-2">
              {recommendation.status}
            </Badge>
            <p className="text-muted-foreground max-w-md mx-auto">
              {recommendation.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Combined Assessment Score</span>
              <span className="font-medium">{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Academic Test</span>
            </CardTitle>
            <CardDescription>Knowledge-based assessment results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {academicTestResults ? (
              <>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(academicTestResults.data.percentage)}`}>
                    {academicTestResults.data.percentage}%
                  </div>
                  <Badge 
                    variant={getScoreBadgeVariant(academicTestResults.data.percentage)} 
                    className="mt-2"
                  >
                    Grade: {academicTestResults.data.grade}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Correct Answers:</span>
                    <span className="font-medium">{academicTestResults.data.correct_answers}/{academicTestResults.data.total_questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={academicTestResults.data.status === 'Pass' ? 'default' : 'destructive'}>
                      {academicTestResults.data.status}
                    </Badge>
                  </div>
                </div>
                <Progress value={academicTestResults.data.percentage} className="h-2" />
              </>
            ) : (
              <p className="text-center text-muted-foreground">No results available</p>
            )}
          </CardContent>
        </Card>

        {/* Personality Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Personality Test</span>
            </CardTitle>
            <CardDescription>Behavioral assessment results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {personalityTestResults ? (
              <>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(personalityTestResults.data.percentage)}`}>
                    {personalityTestResults.data.percentage}%
                  </div>
                  <Badge 
                    variant={getScoreBadgeVariant(personalityTestResults.data.percentage)} 
                    className="mt-2"
                  >
                    Grade: {personalityTestResults.data.grade}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Correct Answers:</span>
                    <span className="font-medium">{personalityTestResults.data.correct_answers}/{personalityTestResults.data.total_questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={personalityTestResults.data.status === 'Pass' ? 'default' : 'destructive'}>
                      {personalityTestResults.data.status}
                    </Badge>
                  </div>
                </div>
                <Progress value={personalityTestResults.data.percentage} className="h-2" />
              </>
            ) : (
              <p className="text-center text-muted-foreground">No results available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Skills Match Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Skills Match Analysis</span>
            </CardTitle>
            <CardDescription>
              Alignment between candidate skills and job requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {skillMatchPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">
                Skills alignment with job requirements
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Matching Skills</span>
                <span>{skillMatch.length}/{selectedJob.skills.length}</span>
              </div>
              <Progress value={skillMatchPercentage} className="h-2" />
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-green-600 mb-2">Matching Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {skillMatch.length > 0 ? skillMatch.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {skill}
                    </Badge>
                  )) : (
                    <span className="text-xs text-muted-foreground">No direct matches found</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Additional Candidate Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {cvData.skills.filter(skill => !skillMatch.includes(skill)).slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {cvData.skills.filter(skill => !skillMatch.includes(skill)).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{cvData.skills.filter(skill => !skillMatch.includes(skill)).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Candidate Profile Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Experience</h4>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {cvData.experience}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Education</h4>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {cvData.education}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Skills Portfolio</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant={skillMatch.includes(skill) ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {skill}
                  {skillMatch.includes(skill) && <CheckCircle className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownloadReport}
          disabled={isDownloadingReport}
          size="lg"
          variant="outline"
          className="px-8 py-6 text-lg font-medium"
        >
          {isDownloadingReport ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-3 h-5 w-5" />
          )}
          {isDownloadingReport ? 'Downloading...' : 'Download Report'}
        </Button>
        
        <Button
          onClick={onBackToJobs}
          size="lg"
          className="px-8 py-6 text-lg font-medium"
        >
          <RotateCcw className="mr-3 h-5 w-5" />
          New Assessment
        </Button>
      </div>
    </div>
  );
};