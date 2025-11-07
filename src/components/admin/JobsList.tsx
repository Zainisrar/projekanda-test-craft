import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { jobsApi, Job, JobFilters } from '@/lib/adminApi';
import { apiClient } from '@/lib/apiClient';
import { Plus, Search, Edit, Trash2, Eye, Users, Calendar } from 'lucide-react';
import { JobForm } from './JobForm';
import { JobDetails } from './JobDetails';
import { Breadcrumb } from '../Breadcrumb';

export const JobsList: React.FC = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: JobFilters = {
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 10
      };

      const response = await jobsApi.getJobs(filters);
      setJobs(response.jobs);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter, currentPage, toast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobsApi.deleteJob(jobId);
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
      loadJobs();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleJobFormClose = () => {
    setShowJobForm(false);
    setEditingJob(null);
    loadJobs();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Jobs' }
        ]} 
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Management</h2>
          <p className="text-muted-foreground">Manage job postings and applications</p>
        </div>
        <Button onClick={() => setShowJobForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs ({jobs.length})</CardTitle>
          <CardDescription>All job postings in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{job.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {job.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{job.company || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{job.location || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{job.type || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{job.salary ?? '-'}</div>
                          </TableCell>
                          <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{job.title}"? This action cannot be undone.
                                  All associated applications will also be removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Modals */}
      {showJobForm && (
        <JobForm
          job={editingJob}
          onClose={handleJobFormClose}
        />
      )}

      {showJobDetails && selectedJob && (
        <JobDetails
          job={selectedJob}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
          onEdit={handleEditJob}
        />
      )}
    </div>
  );
};
