import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ReaderLayout } from "@/components/ui/reader-layout";
import { ArticleReader } from "@/components/ui/article-reader";
import { PdfReader } from "@/components/ui/pdf-reader";
import { useReader } from "@/hooks/use-reader";
import { Document } from "@/lib/types";

export default function Reader() {
  const [match, params] = useRoute("/reader/:id");
  const [_, navigate] = useLocation();
  const { setDocument, setMode, mode } = useReader();
  
  // Fetch document data
  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: [`/api/documents/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch document highlights
  const { data: highlights } = useQuery({
    queryKey: [`/api/documents/${params?.id}/highlights`],
    enabled: !!params?.id,
  });

  // Set document in reader context
  useEffect(() => {
    if (document) {
      setDocument(document);
      // Set mode based on document type
      setMode(document.type as 'url' | 'pdf');
    }
    
    // Cleanup on unmount
    return () => {
      setDocument(null);
    };
  }, [document, setDocument, setMode]);

  // Handle special case for PDF upload route
  useEffect(() => {
    if (params?.id === "upload-pdf") {
      // Open dialog to upload PDF
      setMode("pdf");
    }
  }, [params?.id, setMode]);

  // Handle error cases
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error Loading Document</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The document could not be loaded. It may have been deleted or you don't have permission to view it.
          </p>
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => navigate("/")}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReaderLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : document ? (
        <>
          {mode === 'url' && document.content && (
            <ArticleReader document={document} />
          )}
          {mode === 'pdf' && document.pdfData && (
            <PdfReader document={document} />
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p>Select a document to read or add a new one.</p>
        </div>
      )}
    </ReaderLayout>
  );
}
