
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Initialize the Gemini API client with the secure environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a full SaaS project scaffold based on this description: "${prompt}". 
                 Provide valid SQL for the database schema, a list of REST API routes, 
                 and a list of UI components needed.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            databaseSchema: { type: Type.STRING, description: "PostgreSQL SQL DDL statements" },
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

    if (!response.text) {
      throw new Error("No content returned from the model");
    }

    const result = JSON.parse(response.text.trim());
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return res.status(500).json({ 
      error: error.message || "An unexpected error occurred during scaffolding." 
    });
  }
}
