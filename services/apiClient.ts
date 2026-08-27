import {
  Attachment,
  Idea,
  NFR,
  ProjectCard,
  CsvColumn,
  Subtask,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

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
  request('/ai/summarize', { method: 'POST', body: JSON.stringify({ ideas, attachments }) });

export const analyzeRisks = (nfrs: NFR[]): Promise<string> =>
  request('/ai/risks', { method: 'POST', body: JSON.stringify({ nfrs }) });

export const generateNfrsFromSummary = (
  summary: string,
  ideas: Idea[],
): Promise<Omit<NFR, 'id'>[]> =>
  request('/ai/nfrs', { method: 'POST', body: JSON.stringify({ summary, ideas }) });

export const generateCardsFromSummary = (
  summary: string,
  ideas: Idea[],
  nfrs: NFR[],
): Promise<{ title: string; description: string }[]> =>
  request('/ai/cards', { method: 'POST', body: JSON.stringify({ summary, ideas, nfrs }) });

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
): Promise<Partial<ProjectCard>> =>
  request('/ai/smart-card', {
    method: 'POST',
    body: JSON.stringify({ title, ideas, nfrs, options }),
  });

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
