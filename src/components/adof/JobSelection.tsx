import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api, Test } from '@/lib/api';
import { Briefcase, Search, MapPin, Clock, DollarSign, ChevronRight, AlertCircle, ClipboardCheck } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  test_ids?: string[];
}

interface JobSelectionProps {
  onJobSelect: (job: Job) => void;
}

export const JobSelection: React.FC<JobSelectionProps> = ({ onJobSelect }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);

  // Fetch jobs and tests from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both jobs and tests in parallel
        const [jobsResponse, testsResponse] = await Promise.all([
          fetch('https://projekanda.top/jobs'),
          api.getAllTests().catch(() => ({ tests: [] }))
        ]);
        
        if (!jobsResponse.ok) {
          throw new Error(`Failed to fetch jobs: ${jobsResponse.statusText}`);
        }
        
        const jobsData = await jobsResponse.json();
        console.log('Jobs API response:', jobsData);
        
        // Handle different response formats
        let fetchedJobs = [];
        if (Array.isArray(jobsData)) {
          fetchedJobs = jobsData;
        } else if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
          fetchedJobs = jobsData.jobs;
        } else if (jobsData.data && Array.isArray(jobsData.data)) {
          fetchedJobs = jobsData.data;
        }
        
        // Transform API data to match Job interface
        const transformedJobs = fetchedJobs.map((job: any) => ({
          id: job._id || job.id || job.job_id || '',
          title: job.title || job.job_title || job.name || 'Untitled Position',
          company: job.company || job.company_name || 'Company',
          location: job.location || job.city || 'Not specified',
          type: job.type || job.job_type || job.employment_type || 'Full-time',
          salary: job.salary || job.salary_range || 'Competitive',
          description: job.description || job.job_description || '',
          requirements: Array.isArray(job.requirements) ? job.requirements : 
                       typeof job.requirements === 'string' ? job.requirements.split('\n').filter(Boolean) : [],
          skills: Array.isArray(job.skills) ? job.skills : 
                 typeof job.skills === 'string' ? job.skills.split(',').map((s: string) => s.trim()) : [],
          test_ids: Array.isArray(job.test_ids) ? job.test_ids : []
        }));
        
        setJobs(transformedJobs);
        setAvailableTests(testsResponse.tests || []);
        console.log('Transformed jobs:', transformedJobs.length);
        console.log('Available tests:', testsResponse.tests?.length || 0);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load jobs';
        console.error('Error fetching data:', err);
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const categories = [
    { key: 'all', label: 'All Jobs' },
    { key: 'technology', label: 'Technology' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'business', label: 'Business' },
    { key: 'design', label: 'Design' },
    { key: 'sales', label: 'Sales' }
  ];

  // Helper function to get test names for a job
  const getJobTests = (testIds: string[] | undefined) => {
    if (!testIds || testIds.length === 0) return [];
    return availableTests.filter(test => testIds.includes(test._id));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Simple category matching based on job title/skills
    const categoryMatch = {
      technology: ['software', 'developer', 'data', 'analyst'],
      marketing: ['marketing', 'seo', 'social'],
      business: ['project', 'manager', 'business'],
      design: ['designer', 'ux', 'ui'],
      sales: ['sales', 'representative']
    };
    
    const keywords = categoryMatch[selectedCategory as keyof typeof categoryMatch] || [];
    const matchesCategory = keywords.some(keyword => 
      job.title.toLowerCase().includes(keyword) || 
      job.skills.some(skill => skill.toLowerCase().includes(keyword))
    );
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Available Positions</span>
          </CardTitle>
          <CardDescription>
            Select a job position to begin your assessment process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="grid gap-4">
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium mb-2">Failed to load jobs</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                    <p className="text-muted-foreground font-medium">{job.company}</p>
                  </div>
                  <Button onClick={() => onJobSelect(job)} className="ml-4">
                    Select Job
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <p className="text-foreground mb-4 line-clamp-2">{job.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Display assigned tests */}
                  {job.test_ids && job.test_ids.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" />
                        Required Assessments:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getJobTests(job.test_ids).map((test) => (
                          <Badge key={test._id} variant="outline" className="text-xs">
                            {test.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-foreground">{jobs.length}</div>
              <div>Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{filteredJobs.length}</div>
              <div>Matching Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{categories.length - 1}</div>
              <div>Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};