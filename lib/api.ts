// ShipFast API client — talks to the Cloudflare Worker (D1-backed).
// Session token lives in localStorage under shipfast_token.

const TOKEN_KEY = "shipfast_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — session just won't persist
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers: { ...headers, ...(options.headers as any) } });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }
  if (!res.ok) {
    throw new Error(data?.error || `Server error: ${res.status}`);
  }
  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export async function signup(email: string, password: string, name?: string): Promise<{ user: AuthUser; token: string }> {
  const data = await request<{ user: AuthUser; token: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const data = await request<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function me(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const data = await request<{ user: AuthUser }>("/api/auth/me");
    return data.user;
  } catch {
    setToken(null);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore — clearing local token is what matters
  }
  setToken(null);
}

export interface ProjectRow {
  id: string;
  name: string;
  stack: string;
  status: "idle" | "deploying" | "live" | "failed";
  lastDeployed: string | null;
  scaffold?: any;
}

export async function listProjects(): Promise<ProjectRow[]> {
  const data = await request<{ projects: ProjectRow[] }>("/api/projects");
  return data.projects;
}

export async function createProject(input: {
  name: string;
  stack: string;
  status: string;
  scaffold: unknown;
}): Promise<ProjectRow> {
  const data = await request<{ project: ProjectRow }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.project;
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<ProjectRow, "name" | "stack" | "status" | "lastDeployed" | "scaffold">>
): Promise<ProjectRow> {
  const data = await request<{ project: ProjectRow }>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data.project;
}
