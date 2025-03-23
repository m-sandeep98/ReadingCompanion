import { useEffect, useState } from "react";
import { useReader } from "@/hooks/use-reader";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function SelectionMenu() {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { setSelectedText, openExplanationPanel, selectedText, document } = useReader();

  // Mutation for adding a highlight
  const highlightMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!document) return null;
      
      const res = await apiRequest('POST', '/api/highlights', {
        documentId: document.id,
        text
      });
      return res.json();
    }
  });

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
      openExplanationPanel(data.explanation);
    }
  });

  // Handle text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPosition({
          top: window.scrollY + rect.top - 45,
          left: window.scrollX + rect.left + (rect.width / 2) - 75
        });
        
        setSelectedText(selection.toString());
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      // Close menu when clicking outside
      if (isVisible && e.target instanceof Node) {
        const menu = document.getElementById('selection-menu');
        if (menu && !menu.contains(e.target)) {
          setIsVisible(false);
        }
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setSelectedText, isVisible]);

  const handleHighlight = () => {
    if (selectedText && document) {
      highlightMutation.mutate(selectedText);
      setIsVisible(false);
    }
  };

  const handleExplain = () => {
    if (selectedText) {
      explainMutation.mutate(selectedText);
      setIsVisible(false);
    }
  };

  const handleFindSources = () => {
    // This functionality would be implemented similarly to handleExplain
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="selection-menu"
      className="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 border dark:border-gray-700"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex p-1">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
          title="Highlight"
          onClick={handleHighlight}
        >
          <span className="text-yellow-500">✨</span>
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
          title="Explain"
          onClick={handleExplain}
        >
          <span className="text-green-500">🧠</span>
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
          title="Find Sources"
          onClick={handleFindSources}
        >
          <span className="text-primary">🔍</span>
        </button>
      </div>
    </div>
  );
}
