import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api, Test } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { TestForm } from './TestForm';

const DeleteTestDialog = ({ 
  test, 
  isDeleting, 
  onDelete 
}: { 
  test: Test; 
  isDeleting: boolean; 
  onDelete: () => void;
}) => (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Test</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{test.title}"? This action cannot be undone.
        All associated test data will also be removed.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={onDelete}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          'Delete'
        )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
);

export const TestsList: React.FC = () => {
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async (showToast: boolean = false) => {
    setIsLoading(true);
    setHasError(false);
    try {
      console.log('Loading tests from API...');
      const response = await api.getAllTests();
      console.log('Tests API response:', response);
      setTests(response.tests || []);
      if (showToast) {
        toast({
          title: 'Success',
          description: 'Tests refreshed successfully',
        });
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      setHasError(true);
      if (showToast) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load tests',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTest = () => {
    setSelectedTest(null);
    setIsFormOpen(true);
  };

  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setIsFormOpen(true);
  };

  const handleDeleteTest = async (testId: string) => {
    setDeletingTestId(testId);
    try {
      await api.deleteTest(testId);
      toast({
        title: 'Success',
        description: 'Test deleted successfully',
      });
      loadTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete test',
        variant: 'destructive',
      });
    } finally {
      setDeletingTestId(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTest(null);
    loadTests(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedTest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Test Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage test templates for ADOF assessments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTests(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddTest}>
            <Plus className="w-4 h-4 mr-2" />
            Add Test
          </Button>
        </div>
      </div>

      {/* Error State */}
      {hasError && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Failed to load tests</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>All Tests ({tests.length})</span>
          </CardTitle>
          <CardDescription>
            Test templates available for assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading tests...</p>
              </div>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-semibold text-lg mb-2">No tests found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first test template
                </p>
                <Button onClick={handleAddTest}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test) => (
                      <tr key={test._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium">{test.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {test.description}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(test.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTest(test)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                  disabled={deletingTestId === test._id}
                                >
                                  {deletingTestId === test._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <DeleteTestDialog 
                                test={test}
                                isDeleting={deletingTestId === test._id}
                                onDelete={() => handleDeleteTest(test._id)}
                              />
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {tests.map((test) => (
                  <Card key={test._id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold">{test.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {test.description}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(test.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTest(test)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive flex-1"
                                disabled={deletingTestId === test._id}
                              >
                                {deletingTestId === test._id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <DeleteTestDialog 
                              test={test}
                              isDeleting={deletingTestId === test._id}
                              onDelete={() => handleDeleteTest(test._id)}
                            />
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Form Modal */}
      {isFormOpen && (
        <TestForm
          test={selectedTest}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

