import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractContactsFromImage(base64Image: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            text: "Extract contact information from this image of a list. Return a JSON array of objects with 'firstName', 'lastName', and 'phone' fields. If you can't find a first or last name, use an empty string. Normalize phone numbers to international format if possible, otherwise keep as is.",
          },
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              firstName: { type: Type.STRING },
              lastName: { type: Type.STRING },
              phone: { type: Type.STRING },
            },
            required: ["firstName", "lastName", "phone"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Gemini API Error (Image):", e);
    throw e;
  }
}

export async function parseBulkTextContacts(text: string) {
  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Extract contact information from the following text. Return a JSON array of objects with 'firstName', 'lastName', and 'phone' fields.\n\nText:\n${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              firstName: { type: Type.STRING },
              lastName: { type: Type.STRING },
              phone: { type: Type.STRING },
            },
            required: ["firstName", "lastName", "phone"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Gemini API Error (Text):", e);
    throw e;
  }
}
