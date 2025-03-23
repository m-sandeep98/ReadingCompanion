import { Button } from "@/components/ui/button";
import { useReader } from "@/hooks/use-reader";
import { Document } from "@/lib/types";

interface TopNavProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  document: Document | null;
}

export function TopNav({ onToggleSidebar, isSidebarOpen, document }: TopNavProps) {
  const {
    openDialog,
    toggleAiMenu,
    isAiMenuOpen,
    setDialogTab,
    mode,
    setMode
  } = useReader();

  const handleAddUrl = () => {
    setDialogTab('url');
    openDialog();
  };

  const handleUploadPdf = () => {
    setDialogTab('pdf');
    openDialog();
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-sm px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden mr-2 text-gray-600 dark:text-gray-300"
            >
              <span className="text-xl">☰</span>
            </button>

            {/* Document Type Tabs */}
            {document && (
              <div className="hidden sm:flex space-x-1 ml-2">
                <button
                  className={`px-3 py-1.5 text-sm font-medium rounded-t ${mode === 'url' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                    }`}
                  onClick={() => document.content ? setMode('url') : null}
                  disabled={!document.content}
                >
                  Web Article
                </button>
                <button
                  className={`px-3 py-1.5 text-sm font-medium rounded-t ${mode === 'pdf' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                    }`}
                  onClick={() => document.pdfData ? setMode('pdf') : null}
                  disabled={!document.pdfData}
                >
                  PDF
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* URL Input Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center"
              onClick={handleAddUrl}
            >
              <span className="text-sm mr-1">🔗</span>
              <span>Add URL</span>
            </Button>

            {/* Upload PDF Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center"
              onClick={handleUploadPdf}
            >
              <span className="text-sm mr-1">📄</span>
              <span>Upload PDF</span>
            </Button>

            {/* AI Features Button */}
            <Button
              size="sm"
              className="flex items-center"
              onClick={toggleAiMenu}
            >
              <span className="text-sm mr-1">🧠</span>
              <span>AI Tools</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* AI Tools Menu */}
      {isAiMenuOpen && (
        <div className="absolute right-4 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                toggleAiMenu();
              }}
            >
              <span className="text-green-500 mr-2">🧠</span>
              Explain Selection
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                toggleAiMenu();
              }}
            >
              <span className="text-green-500 mr-2">📝</span>
              Summarize Document
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                toggleAiMenu();
              }}
            >
              <span className="text-green-500 mr-2">🔍</span>
              Find Related Sources
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                toggleAiMenu();
              }}
            >
              <span className="text-green-500 mr-2">❓</span>
              Ask Question
            </button>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 sm:hidden z-30">
        <button
          className="w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center"
          onClick={handleAddUrl}
        >
          <span className="text-xl">🔗</span>
        </button>
        <button
          className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"
          onClick={toggleAiMenu}
        >
          <span className="text-xl">🧠</span>
        </button>
      </div>
    </>
  );
}
