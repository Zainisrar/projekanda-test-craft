import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Job, candidatesApi } from '@/lib/adminApi';
import { Edit, Users, Calendar, Tag, CheckCircle, XCircle, Clock } from 'lucide-react';

interface JobDetailsProps {
  job: Job;
  onClose: () => void;
  onEdit: (job: Job) => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, onClose, onEdit }) => {
  const [applicantCounts, setApplicantCounts] = useState({
    pending: 0,
    accepted: 0,
    total: 0
  });
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  useEffect(() => {
    const fetchApplicantCounts = async () => {
      if (!job?.id) return;
      
      try {
        setIsLoadingCounts(true);
        const response = await candidatesApi.getCandidates({ 
          job_id: job.id,
          limit: 1000 // Get all candidates for this job
        });
        
        const candidates = response.candidates;
        const pending = candidates.filter(c => c.status === 'pending').length;
        const accepted = candidates.filter(c => c.status === 'accepted').length;
        
        setApplicantCounts({
          pending,
          accepted,
          total: candidates.length
        });
      } catch (error) {
        console.error('Failed to fetch applicant counts:', error);
        // Fallback to job.applicants_count if available
        setApplicantCounts({
          pending: 0,
          accepted: 0,
          total: job.applicants_count || 0
        });
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchApplicantCounts();
  }, [job?.id, job?.applicants_count]);

  const getStatusIcon = (status?: string) => {
    if (!status) return <Clock className="w-4 h-4 text-gray-600" />;
    
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">N/A</Badge>;
    
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getStatusIcon(job.status)}
            <span>{job.title}</span>
            {getStatusBadge(job.status)}
          </DialogTitle>
          <DialogDescription>
            Job details and applicant information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Job Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="text-sm">{job.company}</p>
                  </div>
                )}
                {job.location && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-sm">{job.location}</p>
                  </div>
                )}
                {job.type && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm">{job.type}</p>
                  </div>
                )}
                {job.salary && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salary</label>
                    <p className="text-sm">{job.salary}</p>
                  </div>
                )}
                {job.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm">{job.category}</p>
                  </div>
                )}
                {job.status && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span className="text-sm capitalize">{job.status}</span>
                    </div>
                  </div>
                )}
                {job.created_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {job.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">{new Date(job.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>Required qualifications and experience</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>Technical and soft skills needed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applicants Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Applicants</span>
              </CardTitle>
              <CardDescription>Current application statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingCounts ? '...' : applicantCounts.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Applicants</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingCounts ? '...' : applicantCounts.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingCounts ? '...' : applicantCounts.accepted}
                  </div>
                  <div className="text-sm text-muted-foreground">Accepted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {job.created_at ? (
                  <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Job created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Job created</p>
                      <p className="text-xs text-muted-foreground">Date not available</p>
                    </div>
                  </div>
                )}
                {job.updated_at && job.created_at && job.updated_at !== job.created_at && (
                  <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Job updated</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(job)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
