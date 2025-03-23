import { useEffect, useRef, useState } from "react";
import { base64ToBlob, createBlobUrl } from "@/lib/utils";
import { Document as DocumentType } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface SimplePdfViewerProps {
  document: DocumentType;
}

export function SimplePdfViewer({ document }: SimplePdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (document?.pdfData) {
      try {
        const blob = base64ToBlob(document.pdfData);
        const url = createBlobUrl(blob);
        
        // Set the source of the iframe
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
        
        setIsLoading(false);
        setError(null);

        // Clean up the URL when unmounting
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error creating PDF URL:", error);
        setError("Failed to process the PDF file. The file might be corrupted.");
        setIsLoading(false);
      }
    } else {
      setError("No PDF data available for this document.");
      setIsLoading(false);
    }
  }, [document?.pdfData]);

  function zoomIn() {
    setScale(prevScale => Math.min(2.0, prevScale + 0.1));
    if (iframeRef.current) {
      iframeRef.current.style.transform = `scale(${scale + 0.1})`;
      iframeRef.current.style.transformOrigin = 'top center';
    }
  }

  function zoomOut() {
    setScale(prevScale => Math.max(0.5, prevScale - 0.1));
    if (iframeRef.current) {
      iframeRef.current.style.transform = `scale(${scale - 0.1})`;
      iframeRef.current.style.transformOrigin = 'top center';
    }
  }

  function resetZoom() {
    setScale(1.0);
    if (iframeRef.current) {
      iframeRef.current.style.transform = 'scale(1)';
      iframeRef.current.style.transformOrigin = 'top center';
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {/* PDF Metadata */}
      <div className="mb-6 border-b dark:border-gray-700 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-4">
          {document.title}
        </h1>
      </div>

      {/* PDF Controls */}
      <div className="flex flex-wrap justify-between items-center mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <span className="flex items-center text-sm px-2">
            Viewing PDF document
          </span>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            -
          </Button>
          <Button variant="outline" size="sm" onClick={resetZoom}>
            {Math.round(scale * 100)}%
          </Button>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            +
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="pdf-iframe-container flex justify-center">
        {error ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-6 rounded-lg shadow-sm max-w-md text-center">
            <span className="block text-3xl mb-3">⚠️</span>
            <h3 className="text-lg font-medium mb-2">Error Loading PDF</h3>
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.href = "/"}
            >
              Return to Home
            </Button>
          </div>
        ) : (
          <iframe 
            ref={iframeRef}
            style={{ 
              width: '100%', 
              height: '80vh', 
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
            title={document.title}
            onError={() => setError("Failed to load PDF in viewer.")}
          />
        )}
      </div>
    </div>
  );
}