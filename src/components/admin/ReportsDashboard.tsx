import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { reportsApi, Report } from '@/lib/adminApi';
import { FileText, Download, Calendar, BarChart3, Users, Briefcase, Clock } from 'lucide-react';
import { ReportGenerator } from './ReportGenerator';
import { Breadcrumb } from '../Breadcrumb';

export const ReportsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reportsApi.getReports();
      setReports(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, reportsApi, setReports, setIsLoading]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDownloadReport = async (reportId: string) => {
    try {
      const blob = await reportsApi.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download report',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'generating':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hiring_stats':
        return <BarChart3 className="w-5 h-5 text-primary" />;
      case 'activity_logs':
        return <Calendar className="w-5 h-5 text-accent" />;
      case 'test_summaries':
        return <Users className="w-5 h-5 text-success" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hiring_stats':
        return 'Hiring Statistics';
      case 'activity_logs':
        return 'Activity Logs';
      case 'test_summaries':
        return 'Test Summaries';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Reports' }
        ]} 
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports Dashboard</h2>
          <p className="text-muted-foreground">Generate and manage system reports</p>
        </div>
        <Button onClick={() => setShowGenerator(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hiring Statistics</CardTitle>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1">Reports generated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activity Logs</CardTitle>
              <Calendar className="w-5 h-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground mt-1">Reports generated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Test Summaries</CardTitle>
              <Users className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">15</div>
            <p className="text-xs text-muted-foreground mt-1">Reports generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Recent Reports</span>
          </CardTitle>
          <CardDescription>Generated reports and their status</CardDescription>
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
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Generate your first report to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filters Applied</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(report.type)}
                          <div>
                            <div className="font-medium">{getTypeLabel(report.type)}</div>
                            <div className="text-sm text-muted-foreground">ID: {report.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {Object.keys(report.filters).length > 0 ? (
                            <div className="space-y-1">
                              {Object.entries(report.filters).slice(0, 2).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                              {Object.keys(report.filters).length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{Object.keys(report.filters).length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No filters</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {report.status === 'completed' && report.download_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Generator Modal */}
      {showGenerator && (
        <ReportGenerator
          onClose={() => setShowGenerator(false)}
          onReportGenerated={loadReports}
        />
      )}
    </div>
  );
};
