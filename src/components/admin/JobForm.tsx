import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { jobsApi, Job } from '@/lib/adminApi';
import { api, Test } from '@/lib/api';
import { X, Plus, Trash2, ClipboardList, Loader2 } from 'lucide-react';

interface JobFormProps {
  job?: Job | null;
  onClose: () => void;
}

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
  test_ids: string[];
  academic_test_id: string;
  personality_test_id: string;
}

// Job form now follows /jobs API: title, company, location, type, salary, description, skills

export const JobForm: React.FC<JobFormProps> = ({ job, onClose }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    skills: [''],
    test_ids: [],
    academic_test_id: '',
    personality_test_id: ''
  });

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await api.getAllTests();
        setAvailableTests(response.tests || []);
      } catch (error) {
        console.error('Error loading tests:', error);
        toast({
          title: 'Warning',
          description: 'Failed to load tests. You can still create the job.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingTests(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    if (job) {
      // Extract academic and personality test IDs from test_ids array
      const testIds = job.test_ids || [];
      let academicTestId = '';
      let personalityTestId = '';
      
      if (testIds.length > 0) {
        // Try to categorize based on available tests
        testIds.forEach(testId => {
          const test = availableTests.find(t => t._id === testId);
          if (test) {
            const titleLower = test.title.toLowerCase();
            if (titleLower.includes('academic') || titleLower.includes('programming') || titleLower.includes('technical')) {
              academicTestId = testId;
            } else if (titleLower.includes('personality') || titleLower.includes('behavioral')) {
              personalityTestId = testId;
            }
          }
        });
        
        // Fallback: assign first as academic, second as personality
        if (!academicTestId && testIds.length > 0) academicTestId = testIds[0];
        if (!personalityTestId && testIds.length > 1) personalityTestId = testIds[1];
      }
      
      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        type: job.type || '',
        salary: job.salary ? String(job.salary) : '',
        description: job.description || '',
        skills: (job.skills && job.skills.length > 0) ? job.skills : [''],
        test_ids: testIds,
        academic_test_id: academicTestId,
        personality_test_id: personalityTestId
      });
    }
  }, [job, availableTests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.company.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.academic_test_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select an academic test for this job',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Build test_ids array with test._id values: academic test is required, personality test is optional
      const test_ids = [formData.academic_test_id];
      if (formData.personality_test_id) {
        test_ids.push(formData.personality_test_id);
      }
      
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        skills: formData.skills.filter(skill => skill.trim() !== ''),
        test_ids: test_ids // Array of test IDs that will be saved to the database
      };

      if (job) {
        await jobsApi.updateJob(job.id, jobData);
        toast({
          title: 'Success',
          description: 'Job updated successfully',
        });
      } else {
        await jobsApi.createJob(jobData);
        toast({
          title: 'Success',
          description: 'Job created successfully',
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save job',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // requirements field removed - backend /jobs uses skills array and description

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const handleAcademicTestChange = (testId: string) => {
    // Store the test._id value for the academic test
    setFormData(prev => ({
      ...prev,
      academic_test_id: testId
    }));
  };

  const handlePersonalityTestChange = (testId: string) => {
    // Store the test._id value for the personality test, or empty string if 'none' is selected
    setFormData(prev => ({
      ...prev,
      personality_test_id: testId === 'none' ? '' : testId
    }));
  };

  const categorizeTests = () => {
    const academic: Test[] = [];
    const personality: Test[] = [];
    const other: Test[] = [];

    availableTests.forEach(test => {
      const titleLower = test.title.toLowerCase();
      const descLower = test.description?.toLowerCase() || '';
      
      // Check both title and description for categorization
      if (titleLower.includes('personality') || titleLower.includes('behavioral') || 
          descLower.includes('personality') || descLower.includes('behavioral')) {
        personality.push(test);
      } else if (titleLower.includes('academic') || titleLower.includes('programming') || 
                 titleLower.includes('technical') || titleLower.includes('test') ||
                 titleLower.includes('java') || titleLower.includes('python') || 
                 titleLower.includes('javascript') || titleLower.includes('coding')) {
        academic.push(test);
      } else {
        // If uncertain, add to both categories to ensure visibility
        academic.push(test);
        other.push(test);
      }
    });

    return { academic, personality, other };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? 'Edit Job' : 'Create New Job'}
          </DialogTitle>
          <DialogDescription>
            {job ? 'Update job details and requirements' : 'Add a new job posting to the platform'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                    required
                  />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Remote, Nairobi, NY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g. Full-time, Contract"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Required Skills</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="e.g. JavaScript, Python, Project Management"
                  />
                  {formData.skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Test Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Select Tests *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose which tests candidates must complete for this job
                </p>
              </div>
              {isLoadingTests && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            {isLoadingTests ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading tests...</p>
              </div>
            ) : availableTests.length === 0 ? (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tests available. Create tests in the Tests section first.
                </p>
              </div>
            ) : (
              <div className="space-y-4 border border-border rounded-lg p-4">
                {(() => {
                  const { academic, personality, other } = categorizeTests();
                  return (
                    <>
                      {/* Academic Test Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="academic-test">
                          Academic Tests *
                          <span className="text-xs text-muted-foreground ml-2">(Required for job assessment)</span>
                        </Label>
                        {academic.length > 0 ? (
                          <Select
                            value={formData.academic_test_id}
                            onValueChange={handleAcademicTestChange}
                          >
                            <SelectTrigger id="academic-test">
                              <SelectValue placeholder="Select an academic test" />
                            </SelectTrigger>
                            <SelectContent>
                              {academic.map((test) => (
                                <SelectItem key={test._id} value={test._id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{test.title}</span>
                                    <span className="text-xs text-muted-foreground">{test.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground">No academic tests available. Please create one first.</p>
                        )}
                      </div>

                      {/* Personality Test Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="personality-test">
                          Personality Tests
                          <span className="text-xs text-muted-foreground ml-2">(Optional assessment)</span>
                        </Label>
                        {personality.length > 0 ? (
                          <Select
                            value={formData.personality_test_id}
                            onValueChange={handlePersonalityTestChange}
                          >
                            <SelectTrigger id="personality-test">
                              <SelectValue placeholder="Select a personality test (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">No personality test</span>
                              </SelectItem>
                              {personality.map((test) => (
                                <SelectItem key={test._id} value={test._id}>
                                  {test.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="rounded-lg border border-border bg-muted/50 p-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Auto-Generated:</span> Personality tests are automatically generated for each candidate based on their profile.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Selected Tests Summary */}
                      {(formData.academic_test_id || formData.personality_test_id) && (
                        <div className="pt-2 mt-2 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Selected Tests:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.academic_test_id && (
                              <Badge variant="secondary">
                                {availableTests.find(t => t._id === formData.academic_test_id)?.title || 'Academic Test'}
                              </Badge>
                            )}
                            {formData.personality_test_id && (
                              <Badge variant="outline">
                                {availableTests.find(t => t._id === formData.personality_test_id)?.title || 'Personality Test'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
