import { useEffect, useState, useRef } from "react";
import { useFontSize } from "@/hooks/use-font-size";
import { useReader } from "@/hooks/use-reader";
import { Document as DocumentType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { base64ToBlob, createBlobUrl } from "@/lib/utils";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up PDF.js worker
// This configuration specifies the PDF.js worker to be loaded from a CDN
// But we'll make sure it has proper error handling
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfReaderProps {
  document: DocumentType;
}

export function PdfReader({ document }: PdfReaderProps) {
  const { fontSize } = useFontSize();
  const { setSelectedText } = useReader();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document?.pdfData) {
      try {
        const blob = base64ToBlob(document.pdfData);
        const url = createBlobUrl(blob);
        setPdfUrl(url);
        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error creating PDF URL:", error);
        setError("Failed to process the PDF file. The file might be corrupted.");
        setIsLoading(false);
      }
    } else {
      setError("No PDF data available for this document.");
      setIsLoading(false);
    }

    // Cleanup function to revoke the blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [document?.pdfData]);

  useEffect(() => {
    // Add event listener for text selection
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString());
      }
    };

    // Use window.document to avoid variable name collision with the document prop
    if (typeof window !== 'undefined') {
      window.document.addEventListener('mouseup', handleMouseUp);
      return () => window.document.removeEventListener('mouseup', handleMouseUp);
    }
    return undefined;
  }, [setSelectedText]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(numPages || 1, prevPageNumber + offset)));
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(2.0, prevScale + 0.1));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(0.5, prevScale - 0.1));
  }

  function resetZoom() {
    setScale(1.0);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pdf-reader-container" ref={containerRef}>
      {/* PDF Metadata */}
      <div className="mb-6 border-b dark:border-gray-700 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-4">
          {document.title}
        </h1>
      </div>

      {/* PDF Controls */}
      <div className="flex flex-wrap justify-between items-center mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm px-2">
            Page {pageNumber} of {numPages || '-'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
          >
            Next
          </Button>
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
      <div className="pdf-document-container flex justify-center">
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
        ) : pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(pdfError) => {
              console.error("Error loading PDF:", pdfError);
              setError("Failed to load PDF document. It may be damaged or in an unsupported format.");
            }}
            loading={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            }
            className="pdf-document"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
              error={
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded">
                  Failed to render this page. It might be corrupted.
                </div>
              }
            />
          </Document>
        ) : (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded">
            Unable to load PDF. The file might be corrupted or not properly uploaded.
          </div>
        )}
      </div>
    </div>
  );
}
