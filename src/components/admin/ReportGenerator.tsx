import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { reportsApi, ReportFilters } from '@/lib/adminApi';
import { FileText, Calendar, Download, Loader2 } from 'lucide-react';

interface ReportGeneratorProps {
  onClose: () => void;
  onReportGenerated: () => void;
}

const REPORT_TYPES = [
  {
    value: 'hiring_stats',
    label: 'Hiring Statistics',
    description: 'Overview of job postings, applications, and hiring metrics'
  },
  {
    value: 'activity_logs',
    label: 'Activity Logs',
    description: 'System activity and user interactions over time'
  },
  {
    value: 'test_summaries',
    label: 'Test Summaries',
    description: 'Assessment results and performance analytics'
  }
];

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'csv', label: 'CSV Spreadsheet' }
];

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onClose, onReportGenerated }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ReportFilters>({
    type: 'hiring_stats',
    date_from: '',
    date_to: '',
    job_id: '',
    candidate_status: '',
    format: 'pdf'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      toast({
        title: 'Validation Error',
        description: 'Please select a report type',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const report = await reportsApi.generateReport(formData);
      
      toast({
        title: 'Report Generated',
        description: 'Your report is being generated. You will be notified when it\'s ready.',
      });
      
      onReportGenerated();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReportType = REPORT_TYPES.find(type => type.value === formData.type);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Generate Report</span>
          </DialogTitle>
          <DialogDescription>
            Create a custom report with your preferred filters and format
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Type</CardTitle>
              <CardDescription>Choose the type of report you want to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {REPORT_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.type === type.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                      {formData.type === type.value && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date Range</CardTitle>
              <CardDescription>Optional: Filter data by date range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_from">From Date</Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={formData.date_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_from: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_to">To Date</Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={formData.date_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_to: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Filters</CardTitle>
              <CardDescription>Optional: Apply specific filters to your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_id">Job ID</Label>
                  <Input
                    id="job_id"
                    value={formData.job_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_id: e.target.value }))}
                    placeholder="Filter by specific job"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate_status">Candidate Status</Label>
                  <Select 
                    value={formData.candidate_status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, candidate_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
              <CardDescription>Choose the format for your report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FORMAT_OPTIONS.map((format) => (
                  <div
                    key={format.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.format === format.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, format: format.value as 'pdf' | 'csv' }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.format === format.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {format.value === 'pdf' ? 'Portable Document Format' : 'Comma Separated Values'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          {selectedReportType && (
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Report Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Report Type:</span>
                    <Badge variant="outline">{selectedReportType.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Format:</span>
                    <Badge variant="outline">{formData.format?.toUpperCase()}</Badge>
                  </div>
                  {formData.date_from && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Date Range:</span>
                      <span className="text-sm text-muted-foreground">
                        {formData.date_from} to {formData.date_to || 'Present'}
                      </span>
                    </div>
                  )}
                  {formData.job_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Job ID:</span>
                      <span className="text-sm text-muted-foreground">{formData.job_id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
