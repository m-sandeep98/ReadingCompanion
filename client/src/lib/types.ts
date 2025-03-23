export interface Document {
  id: number;
  userId: number;
  title: string;
  url: string | null;
  type: 'url' | 'pdf';
  content: string | null;
  pdfData: string | null;
  addedAt: string;
  readingTime: number | null;
}

export interface Highlight {
  id: number;
  documentId: number;
  userId: number;
  text: string;
  note: string | null;
  explanation: Explanation | null;
  startOffset: number | null;
  endOffset: number | null;
  createdAt: string;
}

export interface Explanation {
  explanation: string;
  key_points: string[];
  additional_resources?: Array<{
    title: string;
    description: string;
  }>;
}

export interface RelatedSource {
  title: string;
  author: string;
  year: number;
  description: string;
}

export interface ReaderState {
  document: Document | null;
  highlights: Highlight[];
  mode: 'url' | 'pdf' | null;
  selectedText: string;
  isExplanationPanelOpen: boolean;
  explanation: Explanation | null;
  isDialogOpen: boolean;
  dialogTab: 'url' | 'pdf';
  isAiMenuOpen: boolean;
}

export interface ReadingProgress {
  percentage: number;
  currentPosition: number;
}
