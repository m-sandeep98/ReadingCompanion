import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useReader } from "@/hooks/use-reader";
import { useLocation } from "wouter";
import { z } from "zod";
import { addUrlDocumentSchema } from "@shared/schema";

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'url' | 'pdf';
}

export function InputDialog({ isOpen, onClose, initialTab }: InputDialogProps) {
  const [tab, setTab] = useState<'url' | 'pdf'>(initialTab);
  const [url, setUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [_, navigate] = useLocation();
  const { closeDialog } = useReader();

  // Mutation for adding a URL document
  const urlMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addUrlDocumentSchema>) => {
      const res = await apiRequest('POST', '/api/documents/url', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setUrl("");
      setError(null);
      closeDialog();
      navigate(`/reader/${data.id}`);
    },
    onError: (error: Error) => {
      setError(`Failed to add URL: ${error.message}`);
    }
  });

  // Mutation for adding a PDF document
  const pdfMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/documents/pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || "Failed to upload PDF");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setPdfTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setError(null);
      closeDialog();

      // Force a short delay before navigation to ensure state is updated
      setTimeout(() => {
        navigate(`/reader/${data.id}`);
      }, 100);
    },
    onError: (error: Error) => {
      setError(`Failed to upload PDF: ${error.message}`);
    }
  });

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = addUrlDocumentSchema.parse({ url });
      urlMutation.mutate(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError("Please enter a valid URL");
      } else {
        setError("An error occurred");
      }
    }
  };

  const handleSubmitPdf = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select a PDF file");
      return;
    }

    const file = fileInputRef.current.files[0];

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError("Please select a valid PDF file");
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError("PDF file is too large (max 10MB)");
      return;
    }

    if (!pdfTitle.trim()) {
      setError("Please enter a title for the PDF");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', pdfTitle);

    pdfMutation.mutate(formData);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Add Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="text-lg">✕</span>
          </button>
        </div>
        <div className="p-4">
          {/* Tab Navigation */}
          <div className="flex border-b dark:border-gray-700 mb-4">
            <button
              className={`px-4 py-2 font-medium ${tab === 'url'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 dark:text-gray-400'
                }`}
              onClick={() => setTab('url')}
            >
              URL
            </button>
            <button
              className={`px-4 py-2 font-medium ${tab === 'pdf'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 dark:text-gray-400'
                }`}
              onClick={() => setTab('pdf')}
            >
              PDF
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* URL Input Tab */}
          {tab === 'url' && (
            <form onSubmit={handleSubmitUrl}>
              <div className="mb-4">
                <Label htmlFor="urlInput" className="block text-sm font-medium mb-1">
                  Enter a URL to read
                </Label>
                <Input
                  type="url"
                  id="urlInput"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={urlMutation.isPending}
              >
                {urlMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Loading...
                  </>
                ) : (
                  "Load Content"
                )}
              </Button>
            </form>
          )}

          {/* PDF Upload Tab */}
          {tab === 'pdf' && (
            <form onSubmit={handleSubmitPdf}>
              <div className="mb-4">
                <Label htmlFor="pdfTitle" className="block text-sm font-medium mb-1">
                  PDF Title
                </Label>
                <Input
                  type="text"
                  id="pdfTitle"
                  placeholder="Enter a title for this PDF"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  required
                  className="w-full mb-4"
                />

                <Label className="block text-sm font-medium mb-1">
                  Upload a PDF file
                </Label>
                <div
                  className="border-2 border-dashed dark:border-gray-600 rounded-md p-6 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('bg-gray-100', 'dark:bg-gray-700');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('bg-gray-100', 'dark:bg-gray-700');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('bg-gray-100', 'dark:bg-gray-700');

                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const file = e.dataTransfer.files[0];

                      // Check if it's a PDF
                      if (file.type === 'application/pdf') {
                        if (fileInputRef.current) {
                          // Create a new FileList to set the input value
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          fileInputRef.current.files = dataTransfer.files;

                          // Auto-populate title if needed
                          if (!pdfTitle) {
                            const fileName = file.name;
                            const titleFromFile = fileName.replace(/\.pdf$/i, '');
                            setPdfTitle(titleFromFile);
                          }
                        }
                      } else {
                        setError("Please upload a PDF file");
                      }
                    }
                  }}
                >
                  <span className="text-gray-400 text-3xl block mb-2">📄</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {fileInputRef.current?.files?.[0] ?
                      `Selected file: ${fileInputRef.current.files[0].name}` :
                      "Drag and drop a PDF file here or click to browse"
                    }
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="pdfFileInput"
                    ref={fileInputRef}
                    onChange={() => {
                      if (fileInputRef.current?.files?.[0] && !pdfTitle) {
                        // Auto-populate title from filename if not set
                        const fileName = fileInputRef.current.files[0].name;
                        const titleFromFile = fileName.replace(/\.pdf$/i, '');
                        setPdfTitle(titleFromFile);
                      }
                      // Force component to re-render to show the selected file
                      setError(null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={pdfMutation.isPending}
              >
                {pdfMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </>
                ) : (
                  "Upload PDF"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
