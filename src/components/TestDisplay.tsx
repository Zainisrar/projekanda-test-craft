import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateTestResponse } from '@/lib/api';
import { ArrowLeft, CheckCircle, FileText, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestDisplayProps {
  testData: GenerateTestResponse;
  onNewTest: () => void;
}

export const TestDisplay: React.FC<TestDisplayProps> = ({ testData, onNewTest }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { toast } = useToast();

  const handleAnswerSelect = (questionIndex: number, optionScore: number) => {
    if (isSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionScore
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length !== testData.questions.length) {
      toast({
        title: 'Incomplete Test',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitted(true);
    const totalScore = Object.values(selectedAnswers).reduce((sum, score) => sum + score, 0);
    const maxScore = testData.questions.length * 5;
    const percentage = Math.round((totalScore / maxScore) * 100);

    toast({
      title: 'Test Submitted!',
      description: `Your score: ${percentage}% (${totalScore}/${maxScore})`,
    });
  };

  const totalScore = isSubmitted ? Object.values(selectedAnswers).reduce((sum, score) => sum + score, 0) : 0;
  const maxScore = testData.questions.length * 5;
  const percentage = isSubmitted ? Math.round((totalScore / maxScore) * 100) : 0;

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
                onClick={onNewTest}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {testData.questions.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Test Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Test</h1>
            <p className="text-muted-foreground">{testData.message}</p>
            
            {isSubmitted && (
              <Card className="mt-6 bg-success/5 border-success/20">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Test Completed! Score: {percentage}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalScore} out of {maxScore} points
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Current Question */}
          <div className="mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1}: {testData.questions[currentQuestionIndex].question}
                </CardTitle>
                <CardDescription>
                  Select the option that best describes your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testData.questions[currentQuestionIndex].options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === option.score;
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(currentQuestionIndex, option.score)}
                        disabled={isSubmitted}
                        className={`w-full p-4 text-left rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-card border-border hover:border-primary/50 text-foreground'
                        } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.text}</span>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          {!isSubmitted && (
            <div className="flex justify-between items-center mb-8">
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
                {testData.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentQuestionIndex
                        ? 'bg-primary'
                        : selectedAnswers[index] !== undefined
                        ? 'bg-success'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {currentQuestionIndex < testData.questions.length - 1 ? (
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
                  className="flex items-center space-x-2 bg-success hover:bg-success/90"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Test</span>
                </Button>
              )}
            </div>
          )}

          {/* Submit Section */}
          {isSubmitted && (
            <div className="mt-12 text-center">
              <Button
                onClick={onNewTest}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg font-medium"
              >
                <RotateCcw className="mr-3 h-5 w-5" />
                Generate New Test
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};