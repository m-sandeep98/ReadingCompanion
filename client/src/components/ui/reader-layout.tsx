import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNav } from "@/components/ui/top-nav";
import { AIExplanationPanel } from "@/components/ui/ai-explanation-panel";
import { InputDialog } from "@/components/ui/input-dialog";
import { SelectionMenu } from "@/components/ui/selection-menu";
import { useReader } from "@/hooks/use-reader";

interface ReaderLayoutProps {
  children: ReactNode;
}

export function ReaderLayout({ children }: ReaderLayoutProps) {
  const { 
    isExplanationPanelOpen, 
    isDialogOpen, 
    dialogTab, 
    selectedText, 
    toggleExplanationPanel,
    closeExplanationPanel,
    closeDialog,
    document,
    explanation
  } = useReader();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Update reading progress on scroll
  useEffect(() => {
    const updateReadingProgress = () => {
      if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
        const scrollTop = window.scrollY || window.document.documentElement.scrollTop;
        const scrollHeight = window.document.documentElement.scrollHeight;
        const clientHeight = window.document.documentElement.clientHeight;
        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        
        setReadingProgress(scrolled);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', updateReadingProgress);
      return () => window.removeEventListener('scroll', updateReadingProgress);
    }
    return undefined;
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Reading progress bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-primary z-50" 
        style={{ width: `${readingProgress}%` }}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        document={document}
      />
      
      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64 lg:ml-64' : 'ml-0 lg:ml-64'}`}>
        {/* Top Navigation */}
        <TopNav 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          document={document}
        />
        
        {/* Reading Area */}
        <div className="px-4 sm:px-6 md:px-8 py-6 max-w-4xl mx-auto">
          {children}
        </div>
        
        {/* AI Explanation Panel */}
        <AIExplanationPanel 
          isOpen={isExplanationPanelOpen} 
          onMinimize={toggleExplanationPanel} 
          onClose={closeExplanationPanel}
          selectedText={selectedText}
          explanation={explanation}
        />
        
        {/* URL/PDF Input Dialog */}
        <InputDialog 
          isOpen={isDialogOpen} 
          onClose={closeDialog} 
          initialTab={dialogTab}
        />
        
        {/* Selection Menu */}
        <SelectionMenu />
      </main>
    </div>
  );
}
