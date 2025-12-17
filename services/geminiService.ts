import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

// Helper to get AI instance. 
// Note: For gemini-3-pro-image-preview, we need to ensure the key is selected via window.aistudio
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview"; // Chat requirement

  try {
    const chat = ai.chats.create({
      model: model,
      history: history,
      config: {
        systemInstruction: "You are a wise, calm, and poetic assistant for the 'Slow and Listen' exhibition. Your tone is warm, empathetic, and slightly literary. You help users reflect on the themes of listening, patience, and rhythm.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I am listening...";
  } catch (error) {
    console.error("Chat Error:", error);
    return "The wind is too loud today, I could not hear you clearly. Please try again.";
  }
};

export const generateExhibitionImage = async (prompt: string, size: ImageSize): Promise<string | null> => {
  // Ensure we have the latest key if using the window.aistudio flow
  const ai = getAI();
  const model = "gemini-3-pro-image-preview"; // Image Gen requirement

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1", // Default square for the aesthetic
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// New function to draft story content
export const draftStoryContent = async (topic: string) => {
  const ai = getAI();
  const model = "gemini-2.5-flash"; 

  const prompt = `Write a short, atmospheric, and literary story or quote for an exhibition called 'Slow and Listen'. 
  The topic is: "${topic}".
  
  If the topic feels like a short wisdom, make it a QUOTE type. If it feels like a narrative, make it a STORY type.
  The tone should be warm, observant, and calm.
  
  Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["STORY", "QUOTE"] },
            excerpt: { type: Type.STRING, description: "A one sentence summary or the quote itself" },
            content: { type: Type.STRING, description: "The full story text. If type is QUOTE, this can be an elaboration." },
            author: { type: Type.STRING, description: "A fictional name fitting the story" }
          },
          required: ["title", "type", "excerpt", "content", "author"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Draft Story Error:", error);
    throw error;
  }
};