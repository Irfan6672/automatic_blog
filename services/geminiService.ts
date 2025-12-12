import { GoogleGenAI, Type } from "@google/genai";
import { ContentConfig } from "../types";

// Initialize the API client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface GeneratedBlogData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  metaDescription: string;
  suggestedSlug: string;
}

export const generateBlogContent = async (topic: string, config?: ContentConfig): Promise<GeneratedBlogData> => {
  if (!apiKey) throw new Error("API Key is missing");

  const sectionCount = config?.sectionCount || 3;
  const imageCount = config?.imageCount || 1;

  const sectionInstruction = `The content MUST have exactly ${sectionCount} main sections (H2 headings). Structure it logically.`;

  const faqInstruction = config?.includeFaq 
    ? `
    Include a "Frequently Asked Questions" section at the very end.
    Format:
    - Use "## Frequently Asked Questions" as the section header.
    - Use H3 ("### Question?") for each question.
    - Keep answers EXTREMELY concise, precise, and to the point (max 2-3 sentences per answer).
    - Include at least 3 Q&A pairs.
    ` 
    : '';

  let imagePlaceholderInstruction = "";
  if (imageCount > 1) {
    const bodyImages = imageCount - 1;
    imagePlaceholderInstruction = `
    You must insert exactly ${bodyImages} image placeholders within the body content.
    Use the strictly defined format: [[IMAGE_PLACEHOLDER_X]] where X is a number from 1 to ${bodyImages}.
    Spread them out evenly between sections. Do not place them at the very start or the very end of the article.
    Example: "...end of paragraph.[[IMAGE_PLACEHOLDER_1]]\n\n## Next Section..."
    `;
  }

  const prompt = `Write a comprehensive, engaging, and SEO-optimized blog post about: "${topic}".
  ${sectionInstruction}
  ${faqInstruction}
  ${imagePlaceholderInstruction}
  
  The content should use Markdown formatting for headings (H1, H2, H3), lists, and emphasis.
  Return the result as a strictly structured JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "Full blog content in Markdown format." },
          excerpt: { type: Type.STRING, description: "A short summary (approx 2 sentences)." },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          metaDescription: { type: Type.STRING },
          suggestedSlug: { type: Type.STRING, description: "URL friendly slug" }
        },
        required: ["title", "content", "excerpt", "tags", "metaDescription", "suggestedSlug"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No content generated");
  
  return JSON.parse(text) as GeneratedBlogData;
};

// Helper to generate a single AI image
const generateSingleAIImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
};

// Helper to search for images
const searchForImages = async (topic: string, count: number): Promise<string[]> => {
    // We use gemini-2.5-flash with googleSearch to find image URLs
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find ${count} high-quality, publicly accessible image URLs related to "${topic}". 
        Return ONLY a raw JSON array of strings. Do not include markdown formatting or explanations. 
        Example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    const text = response.text;
    if (!text) return [];
    try {
        const urls = JSON.parse(text);
        if (Array.isArray(urls)) return urls;
    } catch (e) {
        console.warn("Failed to parse search image results", e);
    }
    return [];
}

export const generateBlogImages = async (topic: string, config?: ContentConfig): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const totalCount = config?.imageCount || 1;
  const source = config?.imageSource || 'AI';
  const images: string[] = [];

  // Determine split for BOTH
  let searchCount = 0;
  let aiCount = 0;

  if (source === 'SEARCH') {
    searchCount = totalCount;
  } else if (source === 'AI') {
    aiCount = totalCount;
  } else if (source === 'BOTH') {
    searchCount = Math.ceil(totalCount / 2);
    aiCount = Math.floor(totalCount / 2);
  }

  // 1. Perform Search if needed
  if (searchCount > 0) {
     try {
         const foundImages = await searchForImages(topic, searchCount);
         images.push(...foundImages);
     } catch (e) {
         console.warn("Image search failed", e);
         // If search fails and we are in BOTH/SEARCH mode, maybe fallback to AI for the missing ones?
         // For now, let's add the missing count to AI to ensure we get *some* images
         aiCount += (searchCount - images.length);
     }
  }

  // 2. Perform AI Generation if needed
  if (aiCount > 0) {
      for (let i = 0; i < aiCount; i++) {
          try {
              const variation = i === 0 ? "main cover" : `variation ${i + 1}, different angle or detail`;
              const prompt = `A high-quality, modern, artistic blog image representing: ${topic}. ${variation}. Photorealistic, 4k, cinematic lighting.`;
              const img = await generateSingleAIImage(prompt);
              images.push(img);
          } catch (e) {
              console.warn(`Failed to generate image ${i + 1}`, e);
          }
      }
  }
  
  return images;
};

// Backward compatibility wrapper
export const generateBlogImage = async (topic: string): Promise<string> => {
    const images = await generateBlogImages(topic, { imageCount: 1, imageSource: 'AI' } as ContentConfig);
    return images[0] || '';
}