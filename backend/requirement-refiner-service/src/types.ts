// Mirrors the frontend's types.ts (ClarityHub root). Kept in sync manually
// since each backend service is deployed independently with no shared
// package — see README for the tradeoff.

export interface Idea {
  id: string;
  content: string;
  category?: string;
}

export interface AttachmentRef {
  id: string;
  name: string;
  mimeType: string;
  // Raw base64 payload, no data: URI prefix.
  base64: string;
}

export interface NFR {
  id: string;
  category: string;
  title: string;
  description: string;
  impactLevel: 'Low' | 'Medium' | 'High';
}

export interface Subtask {
  title: string;
  type: 'Backend' | 'Frontend' | 'Testing' | 'DevOps' | 'Docs';
  storyPoints: number;
  completed: boolean;
}

export interface ProjectCard {
  id?: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  subtasks: Subtask[];
  totalStoryPoints: number;
  justification: string;
  labels: string[];
  risks: string[];
  status?: 'Draft' | 'Ready' | 'Exported';
}

export interface GenerationOptions {
  includeBackend: boolean;
  includeFrontend: boolean;
  includeTesting: boolean;
  includeDocs: boolean;
  detailedEstimation: boolean;
}
