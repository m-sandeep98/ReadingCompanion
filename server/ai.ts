import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL_NAME = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-" // Will be provided through environment variables
});

/**
 * Explains a piece of text using the OpenAI API
 */
export async function explainText(text: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that explains complex concepts clearly and concisely. Format your response as JSON with the following structure: { 'explanation': string, 'key_points': array of strings, 'additional_resources'?: array of objects with title and description }."
        },
        {
          role: "user",
          content: `Please explain the following text in a clear, educational manner:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error explaining text:", error);
    throw new Error("Failed to explain text. Please try again later.");
  }
}

/**
 * Summarizes a longer piece of text using the OpenAI API
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    // Trim text if it's too long to fit in a single API call
    const maxLength = 12000;
    const trimmedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
    
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely while preserving key information and main points. Provide clear, well-structured summaries."
        },
        {
          role: "user",
          content: `Please summarize the following text:\n\n${trimmedText}`
        }
      ]
    });

    return response.choices[0].message.content || "Summary not available.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to summarize text. Please try again later.");
  }
}

/**
 * Finds related sources for a given topic or text
 */
export async function findRelatedSources(text: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are a helpful research assistant. When given a topic or text, suggest related academic sources, articles, or books that would help the user learn more. Format your response as JSON with the structure: { 'sources': array of objects with title, author, year, and brief description }."
        },
        {
          role: "user",
          content: `Please suggest related sources for further reading on this topic:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error finding related sources:", error);
    throw new Error("Failed to find related sources. Please try again later.");
  }
}
