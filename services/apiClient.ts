import {
  Attachment,
  Idea,
  NFR,
  ProjectCard,
  CsvColumn,
  Subtask,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'clarityhub_token';
const PROJECT_KEY = 'clarityhub_project_id';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// The gateway requires a bearer token on every route except /auth/* and
// /health* (JwtAuthGuard, registered globally). Any call anywhere in the
// tree that hits a 401 — not just the login form — means the session
// expired, so it's flagged via a window event instead of a return value:
// that's the only way to reach App's top-level auth state from the dozens
// of independent fetch call sites scattered across the view components.
function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private browsing / storage disabled — session just won't persist across reloads */
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function notifyUnauthorized(): void {
  clearToken();
  window.dispatchEvent(new Event('clarityhub:unauthorized'));
}

// The active project, same storage pattern as the token: every domain
// route (ideas/attachments/cards/nfrs/exports) requires an X-Project-Id
// telling the gateway which of the user's own projects to scope the
// request to (ProjectGuard there checks it's actually theirs before ever
// proxying downstream).
function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(PROJECT_KEY);
  } catch {
    return null;
  }
}

function storeActiveProjectId(id: string): void {
  try {
    localStorage.setItem(PROJECT_KEY, id);
  } catch {
    /* private browsing / storage disabled — selection just won't persist across reloads */
  }
}

function clearActiveProjectId(): void {
  try {
    localStorage.removeItem(PROJECT_KEY);
  } catch {
    /* ignore */
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const projectId = getActiveProjectId();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(projectId ? { 'X-Project-Id': projectId } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    notifyUnauthorized();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      body?.message || `Request to ${path} failed with ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

// The /ai/* routes can run past a minute of Claude generation time, so the
// gateway streams heartbeat whitespace ahead of the real JSON to keep the
// connection alive across proxies/networks that kill long-idle ones — see
// ai.controller.ts. Because that means the status line is locked at 200
// before the real outcome is known, success/failure travels in an
// {ok, data|message} envelope in the body instead of the HTTP status.
async function requestAI<T>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    notifyUnauthorized();
  }

  const text = (await response.text()).trim();
  let envelope: { ok: boolean; data?: T; message?: string };
  try {
    envelope = JSON.parse(text);
  } catch {
    throw new ApiError(`Request to ${path} failed with ${response.status}`, response.status);
  }

  if (!response.ok || !envelope.ok) {
    throw new ApiError(
      envelope.message || `Request to ${path} failed with ${response.status}`,
      response.status,
    );
  }
  return envelope.data as T;
}

// ---------------------------------------------------------------------------
// Auth (api-gateway's own /auth/* — everything else requires the token
// these return)
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const register = (email: string, password: string, name?: string): Promise<AuthUser> =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }).then((res) => {
    setToken(res.accessToken);
    return res.user;
  });

export const login = (email: string, password: string): Promise<AuthUser> =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((res) => {
    setToken(res.accessToken);
    return res.user;
  });

export const getCurrentUser = (): Promise<AuthUser> => request('/auth/me');

export const hasStoredSession = (): boolean => getToken() !== null;

export const logout = (): void => {
  clearToken();
  clearActiveProjectId();
};

// ---------------------------------------------------------------------------
// Projects (api-gateway's own /projects — a PM can work several projects at
// once; everything below this point is scoped to whichever one is active)
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export const getProjects = (): Promise<Project[]> => request('/projects');

export const createProject = (name: string): Promise<Project> =>
  request('/projects', { method: 'POST', body: JSON.stringify({ name }) });

export const getActiveProject = (): string | null => getActiveProjectId();

export const setActiveProject = (projectId: string): void => storeActiveProjectId(projectId);

export const clearActiveProject = (): void => clearActiveProjectId();

// ---------------------------------------------------------------------------
// Ideas & Attachments (idea-board-service)
// ---------------------------------------------------------------------------

export const getIdeas = (): Promise<Idea[]> => request('/ideas');

export const createIdea = (content: string, category?: string): Promise<Idea> =>
  request('/ideas', { method: 'POST', body: JSON.stringify({ content, category }) });

export const deleteIdea = (id: string): Promise<void> =>
  request(`/ideas/${id}`, { method: 'DELETE' });

interface AttachmentSummary {
  id: string;
  name: string;
  mimeType: string;
}

export const createAttachment = (attachment: Attachment): Promise<AttachmentSummary> =>
  request('/attachments', {
    method: 'POST',
    body: JSON.stringify({
      name: attachment.name,
      mimeType: attachment.mimeType,
      base64: attachment.base64,
    }),
  });

export const deleteAttachment = (id: string): Promise<void> =>
  request(`/attachments/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// NFRs (structure-service)
// ---------------------------------------------------------------------------

export const getNfrs = (): Promise<NFR[]> => request('/nfrs');

export const createNfr = (nfr: Omit<NFR, 'id'>): Promise<NFR> =>
  request('/nfrs', { method: 'POST', body: JSON.stringify(nfr) });

export const bulkCreateNfrs = (nfrs: Omit<NFR, 'id'>[]): Promise<NFR[]> =>
  request('/nfrs/bulk', { method: 'POST', body: JSON.stringify({ nfrs }) });

export const deleteNfr = (id: string): Promise<void> =>
  request(`/nfrs/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Cards & Subtasks (structure-service)
// ---------------------------------------------------------------------------

export const getCards = (): Promise<ProjectCard[]> => request('/cards');

export const createCard = (title: string, description?: string): Promise<ProjectCard> =>
  request('/cards', { method: 'POST', body: JSON.stringify({ title, description }) });

export const bulkCreateCards = (
  cards: { title: string; description: string }[],
): Promise<ProjectCard[]> =>
  request('/cards/bulk', { method: 'POST', body: JSON.stringify({ cards }) });

export const updateCard = (id: string, updates: Partial<ProjectCard>): Promise<ProjectCard> =>
  request(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });

export const deleteCard = (id: string): Promise<void> =>
  request(`/cards/${id}`, { method: 'DELETE' });

export const addSubtask = (
  cardId: string,
  subtask: Omit<Subtask, 'id' | 'completed'>,
): Promise<ProjectCard> =>
  request(`/cards/${cardId}/subtasks`, { method: 'POST', body: JSON.stringify(subtask) });

export const updateSubtask = (
  cardId: string,
  subtaskId: string,
  updates: Partial<Subtask>,
): Promise<ProjectCard> =>
  request(`/cards/${cardId}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const removeSubtask = (cardId: string, subtaskId: string): Promise<ProjectCard> =>
  request(`/cards/${cardId}/subtasks/${subtaskId}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// AI (requirement-refiner-service, via api-gateway's RabbitMQ translation)
// ---------------------------------------------------------------------------

export const summarizeIdeas = (ideas: Idea[], attachments: Attachment[]): Promise<string> =>
  requestAI('/ai/summarize', { ideas, attachments });

export const analyzeRisks = (nfrs: NFR[]): Promise<string> => requestAI('/ai/risks', { nfrs });

export const generateNfrsFromSummary = (
  summary: string,
  ideas: Idea[],
): Promise<Omit<NFR, 'id'>[]> => requestAI('/ai/nfrs', { summary, ideas });

export const generateCardsFromSummary = (
  summary: string,
  ideas: Idea[],
  nfrs: NFR[],
): Promise<{ title: string; description: string }[]> =>
  requestAI('/ai/cards', { summary, ideas, nfrs });

export interface GenerationOptions {
  includeBackend: boolean;
  includeFrontend: boolean;
  includeTesting: boolean;
  includeDocs: boolean;
  detailedEstimation: boolean;
}

export const generateSmartCard = (
  title: string,
  ideas: Idea[],
  nfrs: NFR[],
  options: GenerationOptions,
): Promise<Partial<ProjectCard>> => requestAI('/ai/smart-card', { title, ideas, nfrs, options });

// ---------------------------------------------------------------------------
// Exports (jira-exporter-service)
// ---------------------------------------------------------------------------

export interface ExportJob {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  cardCount: number;
  csvContent: string | null;
  errorMessage: string | null;
}

export const createExport = (options: {
  delimiter: ',' | ';';
  includeSubtasks: boolean;
  columns: CsvColumn[];
}): Promise<ExportJob> => request('/exports', { method: 'POST', body: JSON.stringify(options) });
