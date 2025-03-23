import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Document, Highlight, Explanation } from "@/lib/types";

interface ReaderContextProps {
  document: Document | null;
  highlights: Highlight[];
  mode: 'url' | 'pdf' | null;
  selectedText: string;
  isExplanationPanelOpen: boolean;
  explanation: Explanation | null;
  isDialogOpen: boolean;
  dialogTab: 'url' | 'pdf';
  isAiMenuOpen: boolean;
  setDocument: (document: Document | null) => void;
  setHighlights: (highlights: Highlight[]) => void;
  setMode: (mode: 'url' | 'pdf' | null) => void;
  setSelectedText: (text: string) => void;
  openExplanationPanel: (explanation?: Explanation | null) => void;
  closeExplanationPanel: () => void;
  toggleExplanationPanel: () => void;
  setExplanation: (explanation: Explanation | null) => void;
  openDialog: () => void;
  closeDialog: () => void;
  setDialogTab: (tab: 'url' | 'pdf') => void;
  toggleAiMenu: () => void;
}

const ReaderContext = createContext<ReaderContextProps | undefined>(undefined);

interface ReaderProviderProps {
  children: ReactNode;
}

export function ReaderProvider({ children }: ReaderProviderProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [mode, setMode] = useState<'url' | 'pdf' | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isExplanationPanelOpen, setIsExplanationPanelOpen] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'url' | 'pdf'>('url');
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);

  const openExplanationPanel = useCallback((newExplanation: Explanation | null = null) => {
    if (newExplanation) {
      setExplanation(newExplanation);
    }
    setIsExplanationPanelOpen(true);
  }, []);

  const closeExplanationPanel = useCallback(() => {
    setIsExplanationPanelOpen(false);
  }, []);

  const toggleExplanationPanel = useCallback(() => {
    setIsExplanationPanelOpen(prev => !prev);
  }, []);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const toggleAiMenu = useCallback(() => {
    setIsAiMenuOpen(prev => !prev);
  }, []);

  const value = {
    document,
    highlights,
    mode,
    selectedText,
    isExplanationPanelOpen,
    explanation,
    isDialogOpen,
    dialogTab,
    isAiMenuOpen,
    setDocument,
    setHighlights,
    setMode,
    setSelectedText,
    openExplanationPanel,
    closeExplanationPanel,
    toggleExplanationPanel,
    setExplanation,
    openDialog,
    closeDialog,
    setDialogTab,
    toggleAiMenu
  };

  return (
    <ReaderContext.Provider value={value}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (context === undefined) {
    throw new Error("useReader must be used within a ReaderProvider");
  }
  return context;
}