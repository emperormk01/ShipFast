
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-class software architect. Generate a complete, production-ready SaaS project scaffold for: "${prompt}". 
                 
                 STRICT RULES:
                 1. Create a Virtual File System (VFS) as an array of file objects.
                 2. Use Next.js 15, TypeScript, Tailwind CSS, and Prisma/Drizzle.
                 3. Include Functional Core:
                    - Zod schemas for all database models.
                    - Service layer for CRUD operations.
                    - Authentication templates (NextAuth/Clerk setup).
                    - Integration blocks (Stripe utility, webhook handler, and email templates).
                 4. Return a JSON object with: projectName, databaseSchema (DDL), apiRoutes, fileSystem (array of {path, content}), recommendedComponents, and deploymentSteps.`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            databaseSchema: { type: Type.STRING, description: "PostgreSQL DDL" },
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
            fileSystem: {
              type: Type.ARRAY,
              description: "List of files to create.",
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING, description: "Full file path, e.g. 'lib/stripe.ts'" },
                  content: { type: Type.STRING, description: "Source code content" }
                },
                required: ["path", "content"]
              }
            },
            recommendedComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
            deploymentSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["projectName", "databaseSchema", "apiRoutes", "fileSystem", "recommendedComponents", "deploymentSteps"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response.");
    
    return res.status(200).json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("[API Proxy Error]:", error);
    return res.status(500).json({ error: error.message });
  }
}
