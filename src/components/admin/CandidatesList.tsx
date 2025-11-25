import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { candidatesApi, Candidate, CandidateFilters, Job, UserData } from '@/lib/adminApi';
import { apiClient } from '@/lib/apiClient';
import { Search, Download, Eye, CheckCircle, XCircle, FileText, Users, Filter, RefreshCw, Briefcase, Info } from 'lucide-react';
import { CandidateDetails } from './CandidateDetails';
import { CVViewerModal } from './CVViewerModal';
import { Breadcrumb } from '../Breadcrumb';

export const CandidatesList: React.FC = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitlesMap, setJobTitlesMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewMode, setViewMode] = useState<'candidates' | 'all-users'>('all-users');
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCVUrl, setSelectedCVUrl] = useState<string | null>(null);
  const [selectedCVUserName, setSelectedCVUserName] = useState<string>('');

  const loadCandidates = useCallback(async () => {
    // Candidates API endpoint doesn't exist yet, so we'll skip this for now
    // When the backend implements /admin/candidates, uncomment this:
    // try {
    //   setIsLoading(true);
    //   const filters: CandidateFilters = {
    //     job_id: jobFilter && jobFilter !== 'all' ? jobFilter : undefined,
    //     score_min: scoreMin ? Number(scoreMin) : undefined,
    //     score_max: scoreMax ? Number(scoreMax) : undefined,
    //     recommendation: recommendationFilter && recommendationFilter !== 'all' ? recommendationFilter : undefined,
    //     status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
    //     page: currentPage,
    //     limit: 10
    //   };
    //   const response = await candidatesApi.getCandidates(filters);
    //   setCandidates(response.candidates || []);
    //   setTotalPages(Math.ceil((response.total || 0) / 10));
    // } catch (error) {
    //   console.error('Failed to load candidates:', error);
    //   setCandidates([]);
    // } finally {
    //   setIsLoading(false);
    // }
    
    setIsLoading(false);
    setCandidates([]); // Set empty array until backend implements candidates endpoint
  }, [jobFilter, scoreMin, scoreMax, recommendationFilter, statusFilter, currentPage]);

  const loadJobs = useCallback(async () => {
    try {
      setIsLoadingJobs(true);
      
      // Fetch from public jobs API
      const response = await fetch('https://projekanda.top/jobs');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Jobs API response:', data);
      
      // Handle different response formats
      let fetchedJobs = [];
      if (Array.isArray(data)) {
        fetchedJobs = data;
      } else if (data.jobs && Array.isArray(data.jobs)) {
        fetchedJobs = data.jobs;
      } else if (data.data && Array.isArray(data.data)) {
        fetchedJobs = data.data;
      }
      
      setJobs(fetchedJobs);
      
      // Create a map of job_id -> job_title for quick lookups
      const titlesMap = new Map<string, string>();
      fetchedJobs.forEach((job: any) => {
        // Handle different ID field names: _id, id, job_id
        const jobId = job._id || job.id || job.job_id;
        const jobTitle = job.title || job.job_title || job.name;
        if (jobId && jobTitle) {
          titlesMap.set(jobId, jobTitle);
        }
      });
      setJobTitlesMap(titlesMap);
      
      console.log('Jobs loaded:', fetchedJobs.length);
      console.log('Job titles map size:', titlesMap.size);
      console.log('Sample job IDs from map:', Array.from(titlesMap.keys()).slice(0, 5));
      
      if (fetchedJobs.length > 0 && titlesMap.size === 0) {
        console.warn('Jobs loaded but no valid job IDs/titles found. Check job object structure:', fetchedJobs[0]);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
      setJobTitlesMap(new Map());
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  const loadAllUsers = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingUsers(true);
      
      // Clear cache if force refresh is requested
      if (forceRefresh) {
        apiClient.clearCache('users');
      }

      // Use centralized API client with cache-first strategy
      const response = await apiClient.getAllUsers(!forceRefresh);
      console.log('API Response:', response);
      console.log('Users data:', response.users);
      setAllUsers(response.users || []);
      
      // Log unique job IDs from users
      const userJobIds = response.users?.filter(u => u.jobid).map(u => u.jobid) || [];
      const uniqueJobIds = [...new Set(userJobIds)];
      console.log('Unique job IDs from users:', uniqueJobIds);
      
      toast({
        title: 'Success',
        description: response.fromCache 
          ? `Loaded ${response.users?.length || 0} users from cache` 
          : `Fetched ${response.users?.length || 0} users from server`,
        variant: response.fromCache ? 'default' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load all users',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (viewMode === 'candidates') {
      loadCandidates();
      loadJobs();
    } else {
      loadAllUsers(false); // Use cache on initial load
      loadJobs(); // Load jobs for mapping job IDs to titles
    }
  }, [viewMode, loadCandidates, loadJobs, loadAllUsers]);

  // Separate effect for filter changes (only for candidates view)
  useEffect(() => {
    if (viewMode === 'candidates') {
      loadCandidates();
    }
  }, [searchTerm, jobFilter, scoreMin, scoreMax, recommendationFilter, statusFilter, currentPage, viewMode, loadCandidates]);

  const handleUpdateStatus = async (candidateId: string, status: 'pending' | 'accepted' | 'rejected', reason?: string) => {
    try {
      await candidatesApi.updateCandidateStatus(candidateId, status, reason);
      toast({
        title: 'Success',
        description: `Candidate ${status} successfully`,
      });
      loadCandidates();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update candidate status',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadCV = async (candidateId: string) => {
    try {
      const blob = await candidatesApi.downloadCV(candidateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-${candidateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'CV downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download CV',
        variant: 'destructive',
      });
    }
  };

  const handleExportCandidates = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      const filters: CandidateFilters = {
        job_id: jobFilter && jobFilter !== 'all' ? jobFilter : undefined,
        score_min: scoreMin ? Number(scoreMin) : undefined,
        score_max: scoreMax ? Number(scoreMax) : undefined,
        recommendation: recommendationFilter && recommendationFilter !== 'all' ? recommendationFilter : undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      };

      const blob = await candidatesApi.exportCandidates(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: `Candidates exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export candidates',
        variant: 'destructive',
      });
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateDetails(true);
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'accept':
        return <Badge variant="default" className="bg-green-100 text-green-800">Accept</Badge>;
      case 'reject':
        return <Badge variant="destructive">Reject</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{recommendation}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: viewMode === 'candidates' ? 'Candidates' : 'All Users' }
        ]} 
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {viewMode === 'candidates' ? 'Candidate Management' : 'All Users Data'}
          </h2>
          <p className="text-muted-foreground">
            {viewMode === 'candidates' 
              ? 'Review and manage job applicants' 
              : 'View all registered users in the system'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'all-users' ? 'default' : 'outline'}
            onClick={() => setViewMode('all-users')}
          >
            <Users className="w-4 h-4 mr-2" />
            All Users
          </Button>
          {viewMode === 'all-users' && (
            <Button 
              variant="outline" 
              onClick={() => loadAllUsers(true)}
              disabled={isLoadingUsers}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>
              {viewMode === 'candidates' 
                ? `Candidates (${candidates.length})` 
                : `All Users (${allUsers.length})`}
            </span>
          </CardTitle>
          <CardDescription>
            {viewMode === 'candidates' 
              ? 'All job applicants in the system' 
              : 'Complete user database with application details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(viewMode === 'candidates' && isLoading) || (viewMode === 'all-users' && isLoadingUsers) ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          ) : viewMode === 'all-users' ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <h3 className="text-2xl font-bold">{allUsers.length}</h3>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">With CVs</p>
                        <h3 className="text-2xl font-bold">
                          {allUsers.filter(u => u.CVupload).length}
                        </h3>
                      </div>
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Job Applications</p>
                        <h3 className="text-2xl font-bold">
                          {allUsers.filter(u => u.jobid).length}
                        </h3>
                      </div>
                      <Briefcase className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active</p>
                        <h3 className="text-2xl font-bold">
                          {allUsers.filter(u => u.role === 'user').length}
                        </h3>
                      </div>
                      <CheckCircle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full border-collapse table-fixed">
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr className="border-b-2 border-border">
                      <th className="font-bold text-foreground text-left px-2 py-3 w-12">#</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-32">Name</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-40">Email</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-44">Applied Job</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-32">Work Exp.</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-36">Skills</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-36">Education</th>
                      <th className="font-bold text-foreground text-left px-2 py-3 w-40">AI Recommendation</th>
                      <th className="font-bold text-foreground text-center px-2 py-3 w-24">CV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 px-4">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Users className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No users found</p>
                            <p className="text-sm text-muted-foreground">
                              Click refresh to load users from the server
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((user, index) => (
                        <tr key={`${user.user_id}-${index}`} className="hover:bg-muted/50 border-b border-border">
                          <td className="px-2 py-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              #{index + 1}
                            </Badge>
                          </td>
                          <td className="px-2 py-3">
                            <div className="font-medium truncate" title={user.name || 'N/A'}>
                              {user.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="text-sm truncate" title={user.email || 'N/A'}>
                              {user.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            {user.jobid ? (
                              <div className="text-sm" title={jobTitlesMap.get(user.jobid) || user.jobid}>
                                {isLoadingJobs ? (
                                  <span className="text-muted-foreground text-xs">Loading...</span>
                                ) : jobTitlesMap.get(user.jobid) ? (
                                  <span className="font-medium truncate block">{jobTitlesMap.get(user.jobid)}</span>
                                ) : (
                                  <div className="space-y-0.5">
                                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5">
                                      Job ID
                                    </Badge>
                                    <div className="font-mono text-xs text-muted-foreground truncate" title={user.jobid}>
                                      {user.jobid}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Not Applied</span>
                            )}
                          </td>
                          <td className="px-2 py-3">
                            {user.workexperience ? (
                              <div className="text-sm truncate" title={user.workexperience}>
                                {user.workexperience}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-2 py-3">
                            {user.skills ? (
                              <div className="flex flex-wrap gap-1">
                                {user.skills.split(',').slice(0, 2).map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0">
                                    {skill.trim().substring(0, 5)}
                                  </Badge>
                                ))}
                                {user.skills.split(',').length > 2 && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                    +{user.skills.split(',').length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-2 py-3">
                            {user.educationalbackground ? (
                              <p className="text-sm truncate" title={user.educationalbackground}>
                                {user.educationalbackground}
                              </p>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-2 py-3">
                            {user.ai_recommendation ? (
                              <div className="flex items-center gap-1">
                                {user.ai_recommendation === 'Not Recommended' || user.ai_recommendation === 'reject' || user.ai_recommendation.toLowerCase().includes('not') ? (
                                  <Badge variant="destructive" className="text-[10px] font-semibold px-1.5 py-0.5">Not Rec.</Badge>
                                ) : user.ai_recommendation === 'accept' || user.ai_recommendation === 'Recommended' || user.ai_recommendation.toLowerCase().includes('recommend') ? (
                                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold px-1.5 py-0.5">Rec.</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{user.ai_recommendation.substring(0, 8)}</Badge>
                                )}
                                {user.ai_recommendation && user.ai_recommendation.length > 10 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-muted-foreground cursor-help flex-shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md p-3 bg-popover text-popover-foreground">
                                        <p className="text-sm whitespace-pre-wrap">{user.ai_recommendation}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </td>
                          <td className="text-center px-2 py-3">
                            {user.CVupload ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedCVUrl(user.CVupload || null);
                                  setSelectedCVUserName(user.name || '');
                                  setShowCVModal(true);
                                }}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">No CV</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Applied Job</TableHead>
                    <TableHead>Test Score</TableHead>
                    <TableHead>AI Recommendation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {candidate.user_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.email}</div>
                          <div className="text-muted-foreground">{candidate.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{candidate.applied_job_title}</div>
                          <div className="text-muted-foreground">
                            {new Date(candidate.applied_at).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {candidate.test_score}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRecommendationBadge(candidate.ai_recommendation)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCandidate(candidate)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {candidate.cv_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadCV(candidate.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {candidate.status === 'pending' && (
                            <div className="flex space-x-1">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Accept Candidate</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to accept {candidate.name} for the position of {candidate.applied_job_title}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUpdateStatus(candidate.id, 'accepted')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Accept
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Candidate</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject {candidate.name} for the position of {candidate.applied_job_title}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUpdateStatus(candidate.id, 'rejected')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Details Modal */}
      {showCandidateDetails && selectedCandidate && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => {
            setShowCandidateDetails(false);
            setSelectedCandidate(null);
          }}
          onStatusUpdate={handleUpdateStatus}
          onDownloadCV={handleDownloadCV}
        />
      )}

      {/* CV Viewer Modal */}
      <CVViewerModal
        cvUrl={selectedCVUrl}
        candidateName={selectedCVUserName}
        open={showCVModal}
        onOpenChange={(open) => {
          setShowCVModal(open);
          if (!open) {
            setSelectedCVUrl(null);
            setSelectedCVUserName('');
          }
        }}
      />
    </div>
  );
};
