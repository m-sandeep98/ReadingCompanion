import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  addUrlDocumentSchema,
  addPdfDocumentSchema,
  explainTextSchema,
  summarizeDocumentSchema,
  addHighlightSchema
} from "@shared/schema";
import { extractContent } from "./parser";
import { explainText, summarizeText } from "./ai";
import multer from "multer";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  storage: multer.memoryStorage()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler middleware
  const handleError = (err: any, res: Response) => {
    console.error("API Error:", err);

    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        details: fromZodError(err).message
      });
    }

    res.status(500).json({ message: err.message || "Internal server error" });
  };

  // Add a document from URL
  app.post("/api/documents/url", async (req: Request, res: Response) => {
    try {
      const data = addUrlDocumentSchema.parse(req.body);

      // Extract content from URL
      const { content, title, estimatedReadTime } = await extractContent(data.url);

      const document = await storage.addDocument({
        title: data.title || title,
        url: data.url,
        type: "url",
        content,
        readingTime: estimatedReadTime,
        userId: 1, // Default user ID for now
        pdfData: null
      });

      res.json(document);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Add a document from PDF
  // Update the PDF upload route
  app.post("/api/documents/pdf", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      // Validate that it's actually a PDF
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: "Uploaded file is not a PDF" });
      }

      // Validate file size (additional check even though multer has limits)
      if (req.file.size > 10 * 1024 * 1024) { // 10MB
        return res.status(400).json({ message: "PDF file is too large (max 10MB)" });
      }

      const title = req.body.title || "Untitled PDF";
      const pdfData = req.file.buffer.toString('base64');

      const document = await storage.addDocument({
        title,
        url: null,
        type: "pdf",
        content: null,
        readingTime: null,
        userId: 1, // Default user ID for now
        pdfData
      });

      res.json(document);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Get a list of documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getDocuments(1); // Default user ID for now
      res.json(documents);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Get a single document
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Explain text
  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const data = explainTextSchema.parse(req.body);
      const explanation = await explainText(data.text);

      // Save highlight if document ID is provided
      if (data.documentId) {
        await storage.addHighlight({
          documentId: data.documentId,
          userId: 1, // Default user ID for now
          text: data.text,
          note: null,
          explanation,
          startOffset: null,
          endOffset: null
        });
      }

      res.json({ explanation });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Summarize document
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const data = summarizeDocumentSchema.parse(req.body);

      let textToSummarize = "";

      if (data.documentId) {
        const document = await storage.getDocument(data.documentId);
        if (!document || !document.content) {
          return res.status(404).json({ message: "Document not found or has no content" });
        }
        // Force non-null content type since we've checked it above
        textToSummarize = document.content as string;
      } else if (data.text) {
        textToSummarize = data.text;
      } else {
        return res.status(400).json({ message: "Either documentId or text must be provided" });
      }

      const summary = await summarizeText(textToSummarize);

      res.json({ summary });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Add a highlight
  app.post("/api/highlights", async (req: Request, res: Response) => {
    try {
      const data = addHighlightSchema.parse(req.body);

      const highlight = await storage.addHighlight({
        documentId: data.documentId,
        userId: 1, // Default user ID for now
        text: data.text,
        note: null,
        explanation: null,
        startOffset: data.startOffset || null,
        endOffset: data.endOffset || null
      });

      res.json(highlight);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Get highlights for a document
  app.get("/api/documents/:id/highlights", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const highlights = await storage.getHighlightsByDocument(documentId);

      res.json(highlights);
    } catch (err) {
      handleError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
