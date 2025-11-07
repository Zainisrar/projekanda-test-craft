import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Candidate } from '@/lib/adminApi';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Download, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  FileText,
  Award
} from 'lucide-react';

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose: () => void;
  onStatusUpdate: (candidateId: string, status: 'pending' | 'accepted' | 'rejected', reason?: string) => void;
  onDownloadCV: (candidateId: string) => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({ 
  candidate, 
  onClose, 
  onStatusUpdate,
  onDownloadCV 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

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

  const handleAccept = () => {
    onStatusUpdate(candidate.id, 'accepted');
    onClose();
  };

  const handleReject = () => {
    setShowRejectionDialog(true);
  };

  const confirmReject = () => {
    onStatusUpdate(candidate.id, 'rejected', rejectionReason);
    setShowRejectionDialog(false);
    setRejectionReason('');
    onClose();
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <User className="w-6 h-6" />
              <span>{candidate.name}</span>
              {getStatusBadge(candidate.status)}
            </DialogTitle>
            <DialogDescription>
              Candidate details and assessment results
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm">{candidate.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm font-mono">{candidate.user_id}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{candidate.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Application Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Applied Position</label>
                    <p className="text-sm font-medium">{candidate.applied_job_title}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{new Date(candidate.applied_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                    <div>{getStatusBadge(candidate.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">AI Recommendation</label>
                    <div>{getRecommendationBadge(candidate.ai_recommendation)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Assessment Results</span>
                </CardTitle>
                <CardDescription>Test scores and performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Overall Score</div>
                      <div className="text-2xl font-bold text-foreground">{candidate.test_score}%</div>
                    </div>
                    <Award className="w-8 h-8 text-primary" />
                  </div>

                  {candidate.test_results && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Score Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(candidate.test_results).map(([skill, score]) => (
                          <div key={skill} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                            <span className="text-sm font-medium capitalize">{skill.replace('_', ' ')}</span>
                            <Badge variant="outline">{String(score)}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CV and Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Documents</span>
                </CardTitle>
                <CardDescription>CV and supporting documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidate.cv_url ? (
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">CV Document</div>
                          <div className="text-xs text-muted-foreground">PDF format</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadCV(candidate.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No CV document available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {candidate.status === 'pending' && (
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Candidate</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {candidate.name}? You can provide a reason below.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Provide a reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmReject}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject Candidate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
