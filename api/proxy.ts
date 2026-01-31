
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 30, // Extend timeout for complex scaffolding tasks
};

export default async function handler(req: any, res: any) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A valid project description prompt is required.' });
  }

  try {
    // API Key is automatically injected from Vercel Environment Variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-class software architect. Generate a comprehensive SaaS project scaffold for: "${prompt}". 
                 Return a JSON object containing a project name, PostgreSQL DDL schema, REST API route definitions, 
                 and a list of essential UI components.`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            databaseSchema: { type: Type.STRING, description: "Valid PostgreSQL SQL DDL statements including tables and relationships" },
            apiRoutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  method: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["path", "method", "description"]
              }
            },
            recommendedComponents: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            deploymentSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["projectName", "databaseSchema", "apiRoutes", "recommendedComponents", "deploymentSteps"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI model failed to generate a response.");
    }

    const result = JSON.parse(text.trim());
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Scaffolding Engine Error:", error);
    
    // Provide user-friendly error messages based on failure type
    const statusCode = error.status || 500;
    const message = error.message || "The scaffolding engine encountered an error. Please try again.";
    
    return res.status(statusCode).json({ error: message });
  }
}