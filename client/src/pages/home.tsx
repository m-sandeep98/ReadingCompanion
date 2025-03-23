import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { addUrlDocumentSchema } from "@shared/schema";
import { Document } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { useDarkMode } from "@/hooks/use-dark-mode";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Fetch recent documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Mutation for adding a URL
  const urlMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addUrlDocumentSchema>) => {
      const res = await apiRequest('POST', '/api/documents/url', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setUrl("");
      setError(null);
      navigate(`/reader/${data.id}`);
    },
    onError: (error: Error) => {
      setError(`Failed to add URL: ${error.message}`);
    }
  });

  // Handle URL form submission
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

  // Handle PDF upload button click
  const handleUploadPdf = () => {
    navigate("/reader/upload-pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with dark mode toggle */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-primary text-2xl mr-2">📚</span>
            <h1 className="text-2xl font-bold">ReadAI</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-xl">{isDarkMode ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Your AI-Powered Reading Assistant
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Read web articles and PDFs with AI assistance that explains complex concepts,
              summarizes content, and helps you learn more efficiently.
            </p>
          </div>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmitUrl} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1">
                  Enter a URL to start reading
                </label>
                <div className="flex">
                  <Input
                    type="url"
                    id="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="rounded-r-none focus:ring-primary"
                  />
                  <Button 
                    type="submit" 
                    className="rounded-l-none"
                    disabled={urlMutation.isPending}
                  >
                    {urlMutation.isPending ? "Loading..." : "Read Now"}
                  </Button>
                </div>
                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
              </div>
              <div className="text-center">
                <span className="text-gray-500 dark:text-gray-400">or</span>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleUploadPdf}
              >
                <span className="mr-2">📄</span>
                Upload PDF
              </Button>
            </form>
          </div>
        </section>

        {/* Recent Documents */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Documents</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map(doc => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2">{doc.type === 'url' ? '🌐' : '📄'}</span>
                      {doc.title}
                    </CardTitle>
                    <CardDescription>
                      Added {formatRelativeDate(doc.addedAt)}
                      {doc.readingTime && ` • ${doc.readingTime} min read`}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/reader/${doc.id}`)}
                    >
                      Continue Reading
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">No documents yet. Add a URL or upload a PDF to get started.</p>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-green-500 mr-2">🧠</span>
                  AI Explanations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Highlight any text and get an AI-powered explanation to understand complex concepts.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-blue-500 mr-2">📝</span>
                  Summarization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Get concise summaries of entire documents or selected sections to save time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-purple-500 mr-2">🔍</span>
                  Further Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover related sources and additional materials to deepen your knowledge.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-12 py-6 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>ReadAI - Your AI-Powered Reading Assistant</p>
        </div>
      </footer>
    </div>
  );
}
