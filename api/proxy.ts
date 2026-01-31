
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 30, // Extend timeout for complex scaffolding tasks
};

export default async function handler(req: any, res: any) {
  console.log(`[API Proxy] Received request: ${req.method} ${req.url}`);

  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    console.warn(`[API Proxy] Method ${req.method} rejected.`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    console.error("[API Proxy] Validation Error: Missing or invalid prompt.");
    return res.status(400).json({ error: 'A valid project description prompt is required.' });
  }

  console.log(`[API Proxy] Processing prompt of length ${prompt.length} chars.`);

  try {
    if (!process.env.API_KEY) {
      console.error("[API Proxy] Configuration Error: API_KEY is missing from environment.");
      throw new Error("Server configuration error: API Key missing.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    console.log("[API Proxy] Calling Gemini model...");
    const startTime = Date.now();
    
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

    const duration = Date.now() - startTime;
    const text = response.text;
    
    if (!text) {
      console.error("[API Proxy] Model returned an empty response.");
      throw new Error("The AI model failed to generate a response.");
    }

    console.log(`[API Proxy] AI Response generated in ${duration}ms. Output length: ${text.length} chars.`);

    const result = JSON.parse(text.trim());
    console.log(`[API Proxy] JSON parsing successful. Project: ${result.projectName}`);
    
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("[API Proxy] Critical Scaffolding Engine Error:", error);
    
    // Provide user-friendly error messages based on failure type
    const statusCode = error.status || 500;
    const message = error.message || "The scaffolding engine encountered an error. Please try again.";
    
    return res.status(statusCode).json({ error: message });
  }
}
