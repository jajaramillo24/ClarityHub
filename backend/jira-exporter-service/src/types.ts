// Mirrors the shape structure-service returns for a ProjectCard with its
// subtasks (see structure-service/src/cards/*.entity.ts). Duplicated here
// for the same reason as requirement-refiner-service's types.ts — no shared
// package across independently-deployed services yet.

export interface Subtask {
  id: string;
  title: string;
  type: 'Backend' | 'Frontend' | 'Testing' | 'DevOps' | 'Docs';
  storyPoints: number;
  completed: boolean;
}

export interface ProjectCard {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  subtasks: Subtask[];
  totalStoryPoints: number;
  justification: string;
  labels: string[];
  risks: string[];
  status: 'Draft' | 'Ready' | 'Exported';
}

export type CsvField =
  | keyof ProjectCard
  | 'subtasks_count'
  | 'issue_type'
  | 'parent_id'
  | 'assignee'
  | 'priority'
  | 'subtask_type';

export interface CsvColumn {
  id: string;
  header: string;
  enabled: boolean;
  field: CsvField;
}
