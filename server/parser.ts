import axios from "axios";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

/**
 * Extract content from a URL using Mozilla's Readability
 */
export async function extractContent(url: string): Promise<{
  content: string;
  title: string;
  estimatedReadTime: number;
}> {
  try {
    // Fetch the HTML content from the URL
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ReadAI/1.0; +https://readai.app)"
      }
    });

    // Create a DOM from the HTML
    const dom = new JSDOM(response.data, { url });
    
    // Create a new Readability object
    const reader = new Readability(dom.window.document);
    
    // Parse the content
    const article = reader.parse();
    
    if (!article) {
      throw new Error("Could not parse article content");
    }
    
    // Calculate estimated reading time (assuming 200 words per minute)
    const wordCount = article.textContent.split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);
    
    return {
      content: article.content,
      title: article.title,
      estimatedReadTime
    };
  } catch (error) {
    console.error("Error extracting content:", error);
    throw new Error(`Failed to extract content from URL: ${url}`);
  }
}

/**
 * Get the text content from HTML
 */
export function getTextFromHtml(html: string): string {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent || "";
}

/**
 * Estimate reading time for a piece of text
 */
export function estimateReadingTime(text: string): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200); // Assuming 200 words per minute
}
