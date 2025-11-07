import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { AdminSidebar } from './AdminSidebar';
import { JobsList } from './JobsList';
import { CandidatesList } from './CandidatesList';
import { TestsList } from './TestsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Users, 
  LogOut, 
  User,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Home,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { jobsApi, usersApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

type AdminView = 'overview' | 'jobs' | 'candidates' | 'tests' | 'reports' | 'settings';

interface DashboardStats {
  total_jobs: number;
  total_candidates: number;
  pending_reviews: number;
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Initialize session timeout tracking
  useSessionTimeout();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Function to load stats from APIs
  const loadStats = async (showToast: boolean = false) => {
    setIsLoading(true);
    setHasError(false);
    try {
      // Pre-fetch data from both APIs in parallel for faster loading
      // Using All Users API for total candidates count (All Users = Total Candidates)
      const [jobsResponse, usersResponse] = await Promise.all([
        jobsApi.getJobs({ limit: 1000 }, true).catch(err => {
          console.error('Failed to load jobs:', err);
          return { jobs: [], total: 0, page: 1, limit: 0 };
        }),
        usersApi.getAllUsers(true).catch(err => {
          console.error('Failed to load all users:', err);
          return { users: [], message: 'Error' };
        })
      ]);

      // All Users = Total Candidates
      const totalCandidates = usersResponse.users?.length || 0;

      // Count pending reviews (users/candidates that haven't been reviewed yet)
      // Users with no ai_recommendation or ai_recommendation is not "Rec." (recommended)
      const pendingReviews = usersResponse.users?.filter(
        user => !user.ai_recommendation || 
                (user.ai_recommendation !== 'Rec.' && 
                 user.ai_recommendation.toLowerCase() !== 'accept' &&
                 user.ai_recommendation.toLowerCase() !== 'accepted')
      ).length || 0;

      // Set the stats with real data from APIs
      setStats({
        total_jobs: jobsResponse.total,
        total_candidates: totalCandidates,
        pending_reviews: pendingReviews,
        recent_activity: []
      });

      if (showToast) {
        toast({
          title: 'Success',
          description: 'Dashboard stats refreshed successfully',
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setHasError(true);
      // Set default stats on error
      setStats({
        total_jobs: 0,
        total_candidates: 0,
        pending_reviews: 0,
        recent_activity: []
      });
      
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard stats. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats on mount
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'jobs':
        return <JobsList />;
      case 'candidates':
        return <CandidatesList />;
      case 'tests':
        return <TestsList />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Admin Dashboard
                </h2>
                <p className="text-muted-foreground">
                  Manage jobs and candidates
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadStats(true)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Error State */}
            {hasError && !isLoading && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Failed to load dashboard data</p>
                    <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            {isLoading ? (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.total_jobs || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active job postings</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.total_candidates || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">All applicants</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.pending_reviews || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.recent_activity?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            {stats?.recent_activity && stats.recent_activity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recent_activity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => setCurrentView('jobs')}
                  >
                    <Briefcase className="w-6 h-6" />
                    <span className="text-sm">Manage Jobs</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => setCurrentView('candidates')}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Review Candidates</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-6 py-4 max-w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{user?.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {user?.role}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex overflow-hidden h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <AdminSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
};
