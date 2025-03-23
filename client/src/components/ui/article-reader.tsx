import { useEffect, useState, useRef } from "react";
import { useFontSize } from "@/hooks/use-font-size";
import { useReader } from "@/hooks/use-reader";
import { Document } from "@/lib/types";
import { formatRelativeDate, extractDomain } from "@/lib/utils";

interface ArticleReaderProps {
  document: Document;
}

export function ArticleReader({ document }: ArticleReaderProps) {
  const { fontSize } = useFontSize();
  const { setSelectedText } = useReader();
  const [formattedContent, setFormattedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document?.content) {
      // Sanitize and enhance HTML content
      const enhancedContent = document.content
        // Add target="_blank" to all links
        .replace(/<a\s+(?:[^>]*?\s+)?href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
      
      setFormattedContent(enhancedContent);
      setIsLoading(false);
    }
  }, [document?.content]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="reader-container">
      {/* Article Metadata */}
      <div className="mb-8 border-b dark:border-gray-700 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-4">
          {document.title}
        </h1>
        <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 gap-3">
          <span className="flex items-center">
            <span className="mr-1">📅</span>
            {document.addedAt && `Added: ${formatRelativeDate(document.addedAt)}`}
          </span>
          {document.readingTime && (
            <span className="flex items-center">
              <span className="mr-1">⏱️</span>
              {document.readingTime} min read
            </span>
          )}
          {document.url && (
            <span className="flex items-center">
              <span className="mr-1">🌐</span>
              <a 
                href={document.url} 
                className="hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {extractDomain(document.url)}
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div 
        ref={contentRef}
        className="reader-content font-serif text-lg leading-relaxed space-y-6"
        style={{ fontSize: `${fontSize}rem` }}
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </div>
  );
}
