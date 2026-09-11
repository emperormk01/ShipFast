// ShipFast Cloudflare Worker entry.
//
// Serves the Vite SPA from ./dist (Workers Static Assets) and handles:
// - POST /api/proxy (Gemini API proxy with key rotation + model fallback,
//   ported from api/proxy.ts to read keys from Worker env)
// - /api/auth/* (email+password auth, PBKDF2-SHA256, D1 sessions)
// - /api/projects* (owner-scoped project CRUD on D1, replaces Supabase)

// Minimal Cloudflare Worker ambient types (no @cloudflare/workers-types dep).
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
interface D1Result<T = any> {
  results?: T[];
}
interface D1Meta {
  changes?: number;
}
interface D1Response {
  meta: D1Meta;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = any>(): Promise<T | null>;
  all<T = any>(): Promise<D1Result<T>>;
  run(): Promise<D1Response>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  API_KEY?: string;
  GEMINI_API_KEY?: string;
  ENVIRONMENT?: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 19_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Android 16; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0",
];

const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleProxy(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  let { prompt, contents, systemInstruction, tools, generationConfig, model: requestedModel, stream = false } = body;

  if (prompt && !contents) {
    contents = [
      {
        parts: [
          {
            text: `You are a world-class software architect. Generate a complete, production-ready SaaS project scaffold for: "${prompt}".

               STRICT RULES:
               1. Create a Virtual File System (VFS) as an array of file objects.
               2. Use Next.js 15, TypeScript, Tailwind CSS, and Prisma/Drizzle.
               3. Include Functional Core:
                  - Zod schemas for all database models.
                  - Service layer for CRUD operations.
                  - Authentication templates (NextAuth/Clerk setup).
                  - Integration blocks (Stripe utility, webhook handler, and email templates).
               4. Return a JSON object with: projectName, databaseSchema (DDL), apiRoutes, fileSystem (array of {path, content}), recommendedComponents, and deploymentSteps.`,
          },
        ],
      },
    ];
    generationConfig = {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          projectName: { type: "STRING" },
          databaseSchema: { type: "STRING" },
          apiRoutes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                path: { type: "STRING" },
                method: { type: "STRING" },
                description: { type: "STRING" },
              },
              required: ["path", "method", "description"],
            },
          },
          fileSystem: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                path: { type: "STRING" },
                content: { type: "STRING" },
              },
              required: ["path", "content"],
            },
          },
          recommendedComponents: { type: "ARRAY", items: { type: "STRING" } },
          deploymentSteps: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["projectName", "databaseSchema", "apiRoutes", "fileSystem", "recommendedComponents", "deploymentSteps"],
      },
    };
  }

  const primary = requestedModel || FALLBACK_MODELS[0];
  const others = shuffle(FALLBACK_MODELS.filter((m) => m !== primary));
  const modelQueue = [primary, ...others];

  const rawKeys = env.API_KEY || env.GEMINI_API_KEY || "";
  const keyPool = shuffle(rawKeys.split(",").map((k) => k.trim()).filter(Boolean));

  if (keyPool.length === 0) {
    return new Response(JSON.stringify({ error: "No API keys configured" }), {
      status: 500,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  const selectedUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  let lastError = "Request failed after all retries";

  for (const apiKey of keyPool) {
    for (const modelId of modelQueue) {
      try {
        const endpoint = stream ? "streamGenerateContent?alt=sse" : "generateContent";
        const url =
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${endpoint}` +
          `${endpoint.includes("?") ? "&" : "?"}key=${apiKey}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": selectedUA,
            Referer: "https://www.google.com/",
            Origin: "https://www.google.com",
          },
          body: JSON.stringify({
            contents,
            systemInstruction:
              typeof systemInstruction === "string" ? { parts: [{ text: systemInstruction }] } : systemInstruction,
            tools,
            generationConfig,
          }),
        });

        if (response.ok) {
          if (stream) {
            return new Response(response.body, {
              status: 200,
              headers: {
                ...corsHeaders(),
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          }
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          });
        }

        const errorText = await response.text();
        console.warn(`[Proxy] Model ${modelId} failed (${response.status}): ${errorText.substring(0, 100)}`);
        lastError = `Model ${modelId} returned ${response.status}: ${errorText.substring(0, 50)}`;
      } catch (err: any) {
        console.error(`[Proxy] Fetch error with model ${modelId}:`, err);
        lastError = err.message;
      }
    }
  }

  return new Response(JSON.stringify({ error: lastError }), {
    status: 500,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

// ─── Auth + Projects (D1, replaces Supabase) ────────────────────────────────

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function unhex(s: string): Uint8Array {
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: unhex(saltHex), iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return hex(new Uint8Array(bits));
}

function bearerToken(req: Request): string | null {
  const h = req.headers.get("Authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

async function authUser(req: Request, db: D1Database): Promise<UserRow | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const now = new Date().toISOString();
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.created_at FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    )
    .bind(token, now)
    .first<UserRow>();
  return row ?? null;
}

async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_MS);
  await db
    .prepare(`INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`)
    .bind(token, userId, now.toISOString(), expires.toISOString())
    .run();
  return token;
}

function publicUser(u: UserRow): { id: string; email: string; name: string | null } {
  return { id: u.id, email: u.email, name: u.name };
}

async function handleSignup(req: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim().slice(0, 120) || null;

  if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address" }, 400);
  if (password.length < 10) return json({ error: "Password must be at least 10 characters long" }, 400);

  const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
  if (existing) return json({ error: "Email already registered — try signing in instead" }, 400);

  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await hashPassword(password, salt);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, salt, name, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, email, passwordHash, salt, name, now)
    .run();

  const token = await createSession(env.DB, id);
  return json({ user: { id, email, name }, token }, 201);
}

async function handleLogin(req: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return json({ error: "Email and password are required" }, 400);

  const row = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first<any>();
  if (!row) return json({ error: "No account found for this email" }, 401);
  const attempt = await hashPassword(password, row.salt as string);
  if (attempt !== row.password_hash) return json({ error: "Incorrect password" }, 401);

  const token = await createSession(env.DB, row.id as string);
  return json({ user: publicUser(row as unknown as UserRow), token });
}

function projectToJson(row: any): any {
  let scaffold = null;
  if (row.scaffold) {
    try {
      scaffold = JSON.parse(row.scaffold as string);
    } catch {
      scaffold = null;
    }
  }
  return {
    id: row.id,
    name: row.name,
    stack: row.stack,
    status: row.status,
    lastDeployed: (row.last_deployed as string) ?? null,
    scaffold,
  };
}

async function handleProjects(req: Request, env: Env, pathname: string): Promise<Response> {
  const user = await authUser(req, env.DB);
  if (!user) return json({ error: "Unauthorized" }, 401);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });

  if (req.method === "GET" && pathname === "/api/projects") {
    const { results } = await env.DB.prepare(
      `SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC`
    )
      .bind(user.id)
      .all();
    return json({ projects: (results || []).map(projectToJson) });
  }

  if (req.method === "POST" && pathname === "/api/projects") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const name = String(body.name || "Untitled project").slice(0, 200);
    const stack = String(body.stack || "").slice(0, 200);
    const status = ["idle", "deploying", "live", "failed"].includes(body.status) ? body.status : "idle";
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO projects (id, user_id, name, stack, status, scaffold, last_deployed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, user.id, name, stack, status, body.scaffold ? JSON.stringify(body.scaffold) : null, null, now)
      .run();
    const row = await env.DB.prepare(`SELECT * FROM projects WHERE id = ?`).bind(id).first();
    return json({ project: projectToJson(row) }, 201);
  }

  const idMatch = pathname.match(/^\/api\/projects\/([A-Za-z0-9-]+)$/);
  if (idMatch) {
    const id = idMatch[1];
    if (req.method === "PATCH") {
      let body: any;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const sets: string[] = [];
      const params: unknown[] = [];
      if (body.name !== undefined) {
        sets.push("name = ?");
        params.push(String(body.name).slice(0, 200));
      }
      if (body.stack !== undefined) {
        sets.push("stack = ?");
        params.push(String(body.stack).slice(0, 200));
      }
      if (body.status !== undefined && ["idle", "deploying", "live", "failed"].includes(body.status)) {
        sets.push("status = ?");
        params.push(body.status);
      }
      if (body.scaffold !== undefined) {
        sets.push("scaffold = ?");
        params.push(body.scaffold ? JSON.stringify(body.scaffold) : null);
      }
      if (body.lastDeployed !== undefined) {
        sets.push("last_deployed = ?");
        params.push(body.lastDeployed);
      }
      if (sets.length === 0) return json({ error: "Nothing to update" }, 400);
      const res = await env.DB.prepare(`UPDATE projects SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`)
        .bind(...params, id, user.id)
        .run();
      if ((res.meta.changes ?? 0) === 0) return json({ error: "Project not found" }, 404);
      const row = await env.DB.prepare(`SELECT * FROM projects WHERE id = ?`).bind(id).first();
      return json({ project: projectToJson(row) });
    }
    if (req.method === "DELETE") {
      const res = await env.DB.prepare(`DELETE FROM projects WHERE id = ? AND user_id = ?`)
        .bind(id, user.id)
        .run();
      if ((res.meta.changes ?? 0) === 0) return json({ error: "Project not found" }, 404);
      return json({ deleted: true });
    }
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ name: "ShipFast", status: "online" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/proxy") {
      return handleProxy(request, env);
    }

    if (url.pathname === "/api/auth/signup" && request.method === "POST") {
      return handleSignup(request, env);
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await authUser(request, env.DB);
      if (!user) return json({ error: "Unauthorized" }, 401);
      return json({ user: publicUser(user) });
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const token = bearerToken(request);
      if (token) {
        await env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
      }
      return json({ loggedOut: true });
    }

    if (url.pathname === "/api/projects" || url.pathname.startsWith("/api/projects/")) {
      return handleProjects(request, env, url.pathname);
    }

    return env.ASSETS.fetch(request);
  },
};
