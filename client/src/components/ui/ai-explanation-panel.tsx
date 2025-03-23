import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useReader } from "@/hooks/use-reader";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Explanation } from "@/lib/types";

interface AIExplanationPanelProps {
  isOpen: boolean;
  onMinimize: () => void;
  onClose: () => void;
  selectedText: string;
  explanation: Explanation | null;
}

export function AIExplanationPanel({
  isOpen,
  onMinimize,
  onClose,
  selectedText,
  explanation
}: AIExplanationPanelProps) {
  const { document, setExplanation } = useReader();
  const [mode, setMode] = useState<'explain' | 'summarize' | 'sources'>('explain');
  
  // Mutation for explaining text
  const explainMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest('POST', '/api/ai/explain', {
        text,
        documentId: document?.id
      });
      return res.json();
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
    },
  });

  // Mutation for summarizing text
  const summarizeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest('POST', '/api/ai/summarize', {
        text
      });
      return res.json();
    },
    onSuccess: (data) => {
      setExplanation({
        explanation: data.summary,
        key_points: []
      });
    },
  });

  // Mutation for finding related sources
  const findSourcesMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest('POST', '/api/ai/find-sources', {
        text
      });
      return res.json();
    },
    onSuccess: (data) => {
      setExplanation({
        explanation: "Here are some related sources:",
        key_points: data.sources.map((source: any) => 
          `${source.title} by ${source.author} (${source.year})`
        ),
        additional_resources: data.sources
      });
    },
  });

  const handleExplain = () => {
    if (selectedText && !explainMutation.isPending) {
      setMode('explain');
      explainMutation.mutate(selectedText);
    }
  };

  const handleSummarize = () => {
    if (selectedText && !summarizeMutation.isPending) {
      setMode('summarize');
      summarizeMutation.mutate(selectedText);
    }
  };

  const handleFindSources = () => {
    if (selectedText && !findSourcesMutation.isPending) {
      setMode('sources');
      findSourcesMutation.mutate(selectedText);
    }
  };

  const isPending = explainMutation.isPending || summarizeMutation.isPending || findSourcesMutation.isPending;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-md transition-transform duration-300 z-40 ${
        isOpen ? 'transform-none' : 'transform translate-y-full'
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">🧠</span>
          <h3 className="font-medium">
            {mode === 'explain' ? 'AI Explanation' : 
             mode === 'summarize' ? 'AI Summary' : 'Related Sources'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <span className="text-sm">_</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Selected Text:</h4>
          <blockquote className="pl-3 border-l-4 border-primary italic text-gray-700 dark:text-gray-300">
            {selectedText}
          </blockquote>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {mode === 'explain' ? 'Explanation:' : 
             mode === 'summarize' ? 'Summary:' : 'Related Sources:'}
          </h4>
          {isPending ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Generating...</span>
            </div>
          ) : explanation ? (
            <div className="text-gray-800 dark:text-gray-200 space-y-2">
              <p>{explanation.explanation}</p>
              {explanation.key_points && explanation.key_points.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {explanation.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
              {explanation.additional_resources && (
                <div className="mt-2">
                  <h5 className="font-medium">Additional Resources:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {explanation.additional_resources.map((resource, index) => (
                      <li key={index}>
                        <strong>{resource.title}</strong> - {resource.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Select a function below to analyze the selected text.
            </p>
          )}
        </div>
      </div>
      
      <div className="border-t dark:border-gray-700 p-3 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleSummarize}
            disabled={isPending || !selectedText}
          >
            <span className="text-sm mr-1">📝</span>
            <span>Summarize</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleFindSources}
            disabled={isPending || !selectedText}
          >
            <span className="text-sm mr-1">🔍</span>
            <span>Find Sources</span>
          </Button>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center bg-green-600 hover:bg-green-700"
          onClick={handleExplain}
          disabled={isPending || !selectedText}
        >
          <span className="text-sm mr-1">❓</span>
          <span>Explain</span>
        </Button>
      </div>
    </div>
  );
}
