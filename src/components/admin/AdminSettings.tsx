import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Breadcrumb } from '../Breadcrumb';
import { 
  User, 
  Shield, 
  Clock, 
  LogOut, 
  Settings as SettingsIcon,
  Key,
  Activity,
  Calendar
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user, logout, sessionStart, lastActivity } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<string>('');

  // Initialize session timeout tracking
  useSessionTimeout();

  useEffect(() => {
    const updateTimeInfo = () => {
      if (sessionStart && lastActivity) {
        const now = new Date();
        const sessionStartTime = new Date(sessionStart);
        const lastActivityTime = new Date(lastActivity);
        
        // Calculate session duration
        const durationMs = now.getTime() - sessionStartTime.getTime();
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        const durationHours = Math.floor(durationMinutes / 60);
        const remainingMinutes = durationMinutes % 60;
        
        if (durationHours > 0) {
          setSessionDuration(`${durationHours}h ${remainingMinutes}m`);
        } else {
          setSessionDuration(`${durationMinutes}m`);
        }

        // Calculate time remaining (15 minutes from last activity)
        const timeSinceActivity = now.getTime() - lastActivityTime.getTime();
        const timeUntilTimeout = (15 * 60 * 1000) - timeSinceActivity; // 15 minutes in ms
        
        if (timeUntilTimeout > 0) {
          const remainingMs = Math.max(0, timeUntilTimeout);
          const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
          const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          
          if (remainingMinutes > 0) {
            setTimeRemaining(`${remainingMinutes}m ${remainingSeconds}s`);
          } else {
            setTimeRemaining(`${remainingSeconds}s`);
          }
        } else {
          setTimeRemaining('Session expired');
        }
      }
    };

    updateTimeInfo();
    const interval = setInterval(updateTimeInfo, 1000);

    return () => clearInterval(interval);
  }, [sessionStart, lastActivity]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  const getSessionStatus = () => {
    if (!lastActivity) return 'Unknown';
    
    const now = new Date();
    const timeSinceActivity = now.getTime() - lastActivity.getTime();
    const timeUntilTimeout = (15 * 60 * 1000) - timeSinceActivity;
    
    if (timeUntilTimeout <= 0) return 'Expired';
    if (timeUntilTimeout <= 2 * 60 * 1000) return 'Expiring Soon'; // 2 minutes
    return 'Active';
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'Expiring Soon':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Settings' }
        ]} 
      />
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Settings</h2>
        <p className="text-muted-foreground">Manage your admin account and session</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm">{user?.name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-sm font-mono">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Session Information</span>
          </CardTitle>
          <CardDescription>Current session details and timeout settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Session Status</label>
              <div className="flex items-center space-x-2">
                {getSessionStatusBadge(getSessionStatus())}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Time Remaining</label>
              <p className="text-sm font-mono">{timeRemaining}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Session Duration</label>
              <p className="text-sm">{sessionDuration}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
              <p className="text-sm">{formatDate(lastActivity)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Session Started</label>
            <p className="text-sm">{formatDate(sessionStart)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>Security features and session management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Auto-logout on Inactivity</div>
                  <div className="text-xs text-muted-foreground">Session expires after 15 minutes of inactivity</div>
                </div>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Secure Authentication</div>
                  <div className="text-xs text-muted-foreground">JWT-based session management</div>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Admin Permissions</div>
                  <div className="text-xs text-muted-foreground">Full access to all admin functions</div>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">Granted</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage your session and account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium">Sign Out</div>
                <div className="text-sm text-muted-foreground">
                  End your current session and return to login
                </div>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <strong>Note:</strong> Your session will automatically expire after 15 minutes of inactivity. 
              Any unsaved changes will be lost. Make sure to save your work regularly.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
