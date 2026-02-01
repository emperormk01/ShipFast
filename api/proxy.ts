
import { Type } from "@google/genai";

export const config = {
  maxDuration: 60,
  runtime: 'edge', // Using Edge for better streaming performance
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 19_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Android 16; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0"
];

const FALLBACK_MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash'];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Handle Specialized Studio Scaffolder Request
  let { prompt, contents, systemInstruction, tools, generationConfig, model: requestedModel, stream = false } = body;

  if (prompt && !contents) {
    contents = [{ 
      parts: [{ 
        text: `You are a world-class software architect. Generate a complete, production-ready SaaS project scaffold for: "${prompt}". 
               
               STRICT RULES:
               1. Create a Virtual File System (VFS) as an array of file objects.
               2. Use Next.js 15, TypeScript, Tailwind CSS, and Prisma/Drizzle.
               3. Include Functional Core:
                  - Zod schemas for all database models.
                  - Service layer for CRUD operations.
                  - Authentication templates (NextAuth/Clerk setup).
                  - Integration blocks (Stripe utility, webhook handler, and email templates).
               4. Return a JSON object with: projectName, databaseSchema (DDL), apiRoutes, fileSystem (array of {path, content}), recommendedComponents, and deploymentSteps.` 
      }] 
    }];
    generationConfig = {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          databaseSchema: { type: Type.STRING },
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
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["path", "content"]
            }
          },
          recommendedComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
          deploymentSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["projectName", "databaseSchema", "apiRoutes", "fileSystem", "recommendedComponents", "deploymentSteps"]
      }
    };
  }

  // 1. Setup Model Queue
  const primary = requestedModel || FALLBACK_MODELS[0];
  const others = shuffle(FALLBACK_MODELS.filter(m => m !== primary));
  const modelQueue = [primary, ...others];

  // 2. Setup Key Pool
  const rawKeys = process.env.API_KEY || "";
  const keyPool = shuffle(rawKeys.split(",").map(k => k.trim()).filter(Boolean));
  
  if (keyPool.length === 0) {
    return new Response(JSON.stringify({ error: "No API keys configured" }), { status: 500 });
  }

  // 3. User Agent Rotation
  const selectedUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let lastError: string = "Request failed after all retries";

  // Request Loop: Shuffled Keys -> Shuffled Models
  for (const apiKey of keyPool) {
    for (const modelId of modelQueue) {
      try {
        const endpoint = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': selectedUA,
            'Referer': 'https://www.google.com/',
            'Origin': 'https://www.google.com'
          },
          body: JSON.stringify({
            contents,
            systemInstruction: typeof systemInstruction === 'string' ? { parts: [{ text: systemInstruction }] } : systemInstruction,
            tools,
            generationConfig
          })
        });

        if (response.ok) {
          if (stream) {
            return new Response(response.body, {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              }
            });
          } else {
            const data = await response.json();
            return new Response(JSON.stringify(data), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } else {
          const errorText = await response.text();
          console.warn(`[Proxy] Model ${modelId} failed (${response.status}): ${errorText.substring(0, 100)}`);
          lastError = `Model ${modelId} returned ${response.status}: ${errorText.substring(0, 50)}`;
        }
      } catch (err: any) {
        console.error(`[Proxy] Fetch error with model ${modelId}:`, err);
        lastError = err.message;
      }
    }
  }

  return new Response(JSON.stringify({ error: lastError }), { 
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
