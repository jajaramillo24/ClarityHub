export enum Stage {
  FREE_JAM = 'FREE_JAM',
  NON_FUNCTIONAL = 'NON_FUNCTIONAL',
  CARD_CREATION = 'CARD_CREATION',
  KANBAN_BOARD = 'KANBAN_BOARD',
  JIRA_EXPORT = 'JIRA_EXPORT'
}

export type IssueType = 'Story' | 'Task' | 'Bug' | 'Epic';
export type Priority = 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest';
export type KanbanColumnId = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type CardStatus = 'Draft' | 'Ready' | 'Exported' | 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  base64: string; // Raw base64 data without prefix
}

export interface Idea {
  id: string;
  content: string;
  category?: string;
}

export interface NFR {
  id: string;
  category: string;
  title: string;
  description: string;
  impactLevel: 'Low' | 'Medium' | 'High';
}

export interface Subtask {
  id: string;
  title: string;
  type: 'Backend' | 'Frontend' | 'Testing' | 'DevOps' | 'Docs';
  storyPoints: number;
  completed: boolean;
}

export interface ProjectCard {
  id: string;
  key?: string; // e.g. 'CLR-101'
  title: string;
  description: string;
  acceptanceCriteria: string[];
  subtasks: Subtask[];
  totalStoryPoints: number;
  justification: string;
  labels: string[];
  risks: string[];
  status: CardStatus;
  priority?: Priority;
  issueType?: IssueType;
  assignee?: string;
}

export interface StageConfig {
  id: Stage;
  label: string;
  description: string;
}

export interface CsvColumn {
  id: string;
  header: string;
  enabled: boolean;
  field: keyof ProjectCard | 'subtasks_count' | 'issue_type' | 'parent_id' | 'assignee' | 'priority' | 'subtask_type'; // mapped fields
}