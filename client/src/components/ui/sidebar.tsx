import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useFontSize } from "@/hooks/use-font-size";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function Sidebar({ isOpen, onClose, document }: SidebarProps) {
  const [location] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  
  // Fetch recent documents
  const { data: recentDocuments } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    staleTime: 60000, // 1 minute
  });

  return (
    <aside
      className={`w-64 bg-white dark:bg-gray-900 h-screen fixed left-0 top-0 z-40 shadow-md transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* App logo and name */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-xl">📚</span>
            <h1 className="text-xl font-bold">ReadAI</h1>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Document Navigation */}
        <div className="p-4 flex-grow overflow-y-auto">
          {document && (
            <>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Current Document
              </h2>
              <div className="text-sm mb-6 dark:text-gray-300">
                <p className="font-medium">{document.type === 'url' ? 'Web Article: ' : 'PDF: '}{document.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {document.readingTime ? `${document.readingTime} min read` : ''} • Added today
                </p>
              </div>
            </>
          )}

          {/* Table of Contents */}
          {document?.type === 'url' && (
            <>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Table of Contents
              </h3>
              <nav>
                <ul className="space-y-1 text-sm">
                  {/* This would be dynamically generated from the document content */}
                  <li>
                    <a href="#" className="block text-primary py-1">
                      Introduction
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block hover:text-primary py-1 dark:text-gray-300">
                      Main Content
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block hover:text-primary py-1 dark:text-gray-300">
                      Conclusion
                    </a>
                  </li>
                </ul>
              </nav>
            </>
          )}

          {/* Recent Documents */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent Documents
            </h3>
            <ul className="space-y-2 text-sm">
              {recentDocuments?.slice(0, 5).map((doc) => (
                <li key={doc.id} className="py-1 dark:text-gray-300">
                  <Link
                    href={`/reader/${doc.id}`}
                    className="flex items-center hover:text-primary"
                  >
                    <span className="text-gray-400 mr-2 text-sm">
                      {doc.type === 'url' ? '🌐' : '📄'}
                    </span>
                    {doc.title}
                  </Link>
                </li>
              ))}
              {(!recentDocuments || recentDocuments.length === 0) && (
                <li className="py-1 text-gray-500">No recent documents</li>
              )}
            </ul>
          </div>
        </div>

        {/* Settings Section */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                isDarkMode ? 'bg-primary' : 'bg-gray-200'
              } transition-colors duration-300`}
            >
              <span
                className={`absolute ${
                  isDarkMode ? 'left-5' : 'left-0.5'
                } bg-white dark:bg-gray-900 w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center`}
              >
                <span className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-gray-400'}`}>
                  {isDarkMode ? '🌙' : '☀️'}
                </span>
              </span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Font Size</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6 text-xs"
                onClick={decreaseFontSize}
                disabled={fontSize <= 0.875}
              >
                A-
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6 text-base"
                onClick={increaseFontSize}
                disabled={fontSize >= 1.5}
              >
                A+
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
