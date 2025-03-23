import { 
  users, documents, highlights,
  type User, type InsertUser,
  type Document, type InsertDocument,
  type Highlight, type InsertHighlight 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocument(id: number): Promise<ClientDocument | undefined>;
  getDocuments(userId: number): Promise<ClientDocument[]>;
  addDocument(document: InsertDocument): Promise<ClientDocument>;
  
  // Highlight operations
  getHighlight(id: number): Promise<ClientHighlight | undefined>;
  getHighlightsByDocument(documentId: number): Promise<ClientHighlight[]>;
  addHighlight(highlight: InsertHighlight): Promise<ClientHighlight>;
}

// Extend the types from schema to match the client side types
export interface ClientDocument extends Omit<Document, 'addedAt'> {
  addedAt: string;
}

export interface ClientHighlight extends Omit<Highlight, 'createdAt'> {
  createdAt: string;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, ClientDocument>;
  private highlights: Map<number, ClientHighlight>;
  currentUserId: number;
  currentDocumentId: number;
  currentHighlightId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.highlights = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentHighlightId = 1;
    
    // Create a default user for testing purposes
    this.createUser({
      username: "default",
      password: "password"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Document methods
  async getDocument(id: number): Promise<ClientDocument | undefined> {
    return this.documents.get(id);
  }
  
  async getDocuments(userId: number): Promise<ClientDocument[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }
  
  async addDocument(insertDoc: InsertDocument): Promise<ClientDocument> {
    const id = this.currentDocumentId++;
    const now = new Date();
    
    const document: ClientDocument = {
      ...insertDoc,
      id,
      userId: insertDoc.userId || 1, // Default to user 1 if userId is not provided
      url: insertDoc.url || null,
      content: insertDoc.content || null,
      pdfData: insertDoc.pdfData || null,
      readingTime: insertDoc.readingTime || null,
      addedAt: now.toISOString(),
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  // Highlight methods
  async getHighlight(id: number): Promise<ClientHighlight | undefined> {
    return this.highlights.get(id);
  }
  
  async getHighlightsByDocument(documentId: number): Promise<ClientHighlight[]> {
    return Array.from(this.highlights.values())
      .filter(highlight => highlight.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async addHighlight(insertHighlight: InsertHighlight): Promise<ClientHighlight> {
    const id = this.currentHighlightId++;
    const now = new Date();
    
    const highlight: ClientHighlight = {
      ...insertHighlight,
      id,
      userId: insertHighlight.userId || 1, // Default to user 1 if userId is not provided
      documentId: insertHighlight.documentId || 1, // Default to document 1 if documentId is not provided
      note: insertHighlight.note || null,
      explanation: insertHighlight.explanation || null,
      startOffset: insertHighlight.startOffset || null,
      endOffset: insertHighlight.endOffset || null,
      createdAt: now.toISOString(),
    };
    
    this.highlights.set(id, highlight);
    return highlight;
  }
}

export const storage = new MemStorage();
