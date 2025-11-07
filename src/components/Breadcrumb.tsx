import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => navigate('/')}
      >
        <Home className="w-4 h-4" />
      </Button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4" />
          {item.path && index < items.length - 1 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:text-foreground"
              onClick={() => navigate(item.path!)}
            >
              {item.label}
            </Button>
          ) : (
            <span className={index === items.length - 1 ? 'font-medium text-foreground' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
