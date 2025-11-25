import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CVViewerModalProps {
  cvUrl: string | null;
  candidateName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CVViewerModal: React.FC<CVViewerModalProps> = ({
  cvUrl,
  candidateName,
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (open && cvUrl) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
    }
  }, [open, cvUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load CV. The file may be corrupted or inaccessible.');
  };

  const handleDownload = () => {
    if (!cvUrl) return;
    
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = `CV-${candidateName || 'candidate'}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (extension === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(extension)) return 'Word Document';
    return 'Document';
  };

  const isPDF = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf');
  };

  if (!cvUrl) {
    return null;
  }

  // Construct full URL - handle both absolute URLs and relative paths
  let fullUrl: string;
  if (cvUrl.startsWith('http://') || cvUrl.startsWith('https://')) {
    fullUrl = cvUrl;
  } else if (cvUrl.startsWith('/')) {
    // Path starts with /, so prepend base URL without extra slash
    fullUrl = `https://projekanda.top${cvUrl}`;
  } else {
    // Relative path, prepend base URL with slash
    fullUrl = `https://projekanda.top/${cvUrl}`;
  }
  
  const fileType = getFileType(fullUrl);
  const canViewInline = isPDF(fullUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>CV Viewer</span>
            {candidateName && (
              <span className="text-sm font-normal text-muted-foreground">
                - {candidateName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Viewing {fileType} document
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {hasError ? (
            <Alert variant="destructive" className="flex-1 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {errorMessage || 'Unable to display CV. Please try downloading it instead.'}
              </AlertDescription>
            </Alert>
          ) : canViewInline ? (
            <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/20">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading CV...</p>
                  </div>
                </div>
              )}
              <iframe
                src={fullUrl}
                className="w-full h-full min-h-[500px] border-0"
                title="CV Viewer"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border rounded-lg bg-muted/20">
              <div className="text-center space-y-4 p-8">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">This file type cannot be viewed inline</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fileType} files need to be downloaded to view
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownload} variant="default">
              <Download className="w-4 h-4 mr-2" />
              Download CV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

