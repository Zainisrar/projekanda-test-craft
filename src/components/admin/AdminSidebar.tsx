import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Users, 
  BarChart3,
  Home,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminView = 'overview' | 'jobs' | 'candidates' | 'tests' | 'reports' | 'settings';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const navigationItems = [
  {
    id: 'overview' as AdminView,
    label: 'Overview',
    icon: Home,
    description: 'Dashboard overview'
  },
  {
    id: 'jobs' as AdminView,
    label: 'Jobs',
    icon: Briefcase,
    description: 'Manage job postings'
  },
  {
    id: 'candidates' as AdminView,
    label: 'Candidates',
    icon: Users,
    description: 'Review applicants'
  },
  {
    id: 'tests' as AdminView,
    label: 'Tests',
    icon: ClipboardList,
    description: 'Manage test questions'
  }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  
  // Debug: Log navigation items
  React.useEffect(() => {
    console.log('Navigation items:', navigationItems);
    console.log('Navigation items length:', navigationItems.length);
  }, []);

  // Close mobile menu on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background/90 backdrop-blur-sm shadow-lg"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" aria-label="Admin navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-4 text-left transition-colors",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileOpen(false);
                  }}
                  aria-label={`${item.label} - ${item.description}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-80 truncate">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs" aria-hidden="true">
                        Active
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground text-center">
              <p>Admin Dashboard v1.0</p>
              <p className="mt-1">Secure • Fast • Reliable</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
