import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  api, 
  GenerateTestQuestionsResponse, 
  GenerateTestResponse,
  SubmitTestResultResponse,
  TestQuestionNew,
  Test
} from '@/lib/api';
import { ArrowLeft, CheckCircle, FileText, ChevronLeft, ChevronRight, Loader2, User, Briefcase, ClipboardCheck } from 'lucide-react';

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

interface ADOFTestDisplayProps {
  selectedJob: SelectedJob;
  cvData: CVData;
  userId: string;
  testType: 'academic' | 'personality';
  onTestComplete: (results: SubmitTestResultResponse) => void;
  onBack: () => void;
}

export const ADOFTestDisplay: React.FC<ADOFTestDisplayProps> = ({ 
  selectedJob, 
  cvData, 
  userId, 
  testType,
  onTestComplete, 
  onBack 
}) => {
  const { toast } = useToast();
  const [testData, setTestData] = useState<GenerateTestQuestionsResponse | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);

  useEffect(() => {
    // Reset state when test type changes
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestData(null);
    loadTestsAndGenerate();
  }, [userId, testType]);

  const loadTestsAndGenerate = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to generate test.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingTest(true);
    try {
      // IMPORTANT: Personality tests ALWAYS use /generate_test endpoint with ONLY user_id
      // Academic tests use /generate-test-questions with job_id + test_id
      if (testType === 'personality') {
        console.log('Loading personality test with user_id only (no job_id or test_id)');
        await generatePersonalityTest();
        return;
      }

      // For academic tests ONLY: use /generate-test-questions with job_id + test_id
      console.log('Loading academic test with job_id + test_id');
      const testsResponse = await api.getAllTests();
      setAvailableTests(testsResponse.tests || []);

      let testIdToUse: string | null = null;

      // Priority 1: Use job's assigned academic test_id (index 0)
      if (selectedJob.test_ids && selectedJob.test_ids.length > 0) {
        // First test_id in array is always the academic test
        testIdToUse = selectedJob.test_ids[0];
        console.log('Using job academic test_id:', testIdToUse);
      }

      // Priority 2: Fallback to keyword search (backward compatibility)
      if (!testIdToUse) {
        const selectedTest = testsResponse.tests?.find(test => 
          test.title.toLowerCase().includes('academic') ||
          test.title.toLowerCase().includes('programming') ||
          test.title.toLowerCase().includes('technical')
        );

        if (selectedTest) {
          testIdToUse = selectedTest._id;
          console.log('Using fallback academic test:', selectedTest.title);
        } else if (testsResponse.tests && testsResponse.tests.length > 0) {
          // Last resort: use first available test
          testIdToUse = testsResponse.tests[0]._id;
          console.log('Using first available test as fallback');
        }
      }

      if (testIdToUse) {
        await generateTestQuestions(testIdToUse);
      } else {
        throw new Error('No academic test found. Please create tests in the admin panel or assign tests to this job.');
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast({
        title: 'Test Loading Failed',
        description: error instanceof Error ? error.message : 'Failed to load test. Please try again.',
        variant: 'destructive',
      });
      setIsLoadingTest(false);
    }
  };

  const generatePersonalityTest = async () => {
    try {
      const response = await api.generateTest(userId);
      
      // Transform GenerateTestResponse to GenerateTestQuestionsResponse structure
      const mcqsId = response.mcqs_id || response.document_id || response.documentId || response.id || response._id || '';
      
      if (!mcqsId) {
        throw new Error('Test ID not found in response');
      }

      // Transform TestQuestion to TestQuestionNew format
      const transformedQuestions: TestQuestionNew[] = response.questions.map((q, index) => ({
        question: q.question,
        question_no: q.question_no || (index + 1),
        options: q.options.map(opt => ({
          text: opt.text,
          is_correct: false // Personality tests don't have correct/incorrect answers
        }))
      }));

      // Create GenerateTestQuestionsResponse structure
      const transformedResponse: GenerateTestQuestionsResponse = {
        message: response.message || 'Test generated successfully',
        data: {
          test_id: mcqsId, // Use mcqs_id as test_id for compatibility
          test_title: 'Personality Assessment',
          job_id: selectedJob.id,
          job_title: selectedJob.title,
          questions: transformedQuestions,
          generated_at: new Date().toISOString()
        }
      };

      setTestData(transformedResponse);
      toast({
        title: 'Test Generated',
        description: 'Your personality assessment is ready.',
      });
    } catch (error) {
      console.error('Error generating personality test:', error);
      toast({
        title: 'Test Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate personality test.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoadingTest(false);
    }
  };

  const generateTestQuestions = async (testId: string) => {
    try {
      const response = await api.generateTestQuestions({
        job_id: selectedJob.id,
        test_id: testId,
      });
      setTestData(response);
      toast({
        title: 'Test Generated',
        description: `Your ${testType} assessment is ready.`,
      });
    } catch (error) {
      console.error('Error generating test questions:', error);
      toast({
        title: 'Test Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate test questions.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionText: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionText
    }));
  };

  const handleNext = () => {
    if (testData && currentQuestionIndex < testData.data.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testData) return;

    if (Object.keys(selectedAnswers).length !== testData.data.questions.length) {
      toast({
        title: 'Incomplete Test',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert answers to the required format (question_no as key)
      const answersForAPI: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([questionIndex, answerText]) => {
        const question = testData.data.questions[parseInt(questionIndex)];
        answersForAPI[question.question_no.toString()] = answerText;
      });

      const requestBody = {
        user_id: userId,
        job_id: selectedJob.id,
        test_id: testData.data.test_id,
        questions: testData.data.questions,
        user_answers: answersForAPI,
      };

      console.log('Submitting test result:', requestBody);

      const submitResponse = await api.submitTestResult(requestBody);
      
      toast({
        title: 'Assessment Completed!',
        description: `Your score: ${submitResponse.data.percentage}% (${submitResponse.data.grade})`,
      });

      onTestComplete(submitResponse);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTest) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Generating Your Assessment</h3>
                <p className="text-muted-foreground">
                  Creating a personalized {testType} test based on the selected job position...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testData || !testData.data.questions || testData.data.questions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No test questions available. Please try again.
              </p>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = testData.data.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.data.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === testData.data.questions.length - 1;

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5" />
                <span>{testType === 'academic' ? 'Academic' : 'Personality'} Test</span>
              </CardTitle>
              <CardDescription>{testData.data.test_title}</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {currentQuestionIndex + 1} / {testData.data.questions.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Job & Candidate Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Position</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{selectedJob.title}</p>
            <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Candidate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{cvData.name}</p>
            <p className="text-sm text-muted-foreground">{cvData.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Badge variant="secondary">Question {currentQuestion.question_no}</Badge>
              <CardTitle className="text-xl mt-2">{currentQuestion.question}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option.text;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, option.text)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={isSelected ? 'font-medium' : ''}>
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          {!isSubmitting && (
            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-2">
                {testData.data.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentQuestionIndex
                        ? 'bg-primary'
                        : selectedAnswers[index] !== undefined
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {!isLastQuestion ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.keys(selectedAnswers).length !== testData.data.questions.length}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Complete Assessment'}</span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {testType === 'academic' ? 'CV Submission' : 'Academic Test'}
        </Button>
      </div>
    </div>
  );
};
