import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateTestResponse } from '@/lib/api';
import { ArrowLeft, CheckCircle, FileText, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestDisplayProps {
  testData: GenerateTestResponse;
  onNewTest: () => void;
}

export const TestDisplay: React.FC<TestDisplayProps> = ({ testData, onNewTest }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleAnswerSelect = (questionIndex: number, optionScore: number) => {
    if (isSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionScore
    }));
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
                Document ID: <span className="font-mono">{testData.document_id}</span>
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

          {/* Questions */}
          <div className="space-y-8">
            {testData.questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {questionIndex + 1}
                  </CardTitle>
                  <CardDescription>
                    Select the option that best describes your response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[questionIndex] === option.score;
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(questionIndex, option.score)}
                          disabled={isSubmitted}
                          className={`w-full p-4 text-left rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-card border-border hover:border-primary/50 text-foreground'
                          } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option.text}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                Score: {option.score}
                              </span>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Section */}
          <div className="mt-12 text-center">
            {!isSubmitted ? (
              <Button
                onClick={handleSubmit}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
              >
                <CheckCircle className="mr-3 h-5 w-5" />
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={onNewTest}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg font-medium"
              >
                <RotateCcw className="mr-3 h-5 w-5" />
                Generate New Test
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};