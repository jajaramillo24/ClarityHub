import { z } from 'zod';

export const NFR_CATEGORIES = [
  'Security',
  'Performance',
  'Scalability',
  'Accessibility',
  'Privacy',
  'Reliability',
  'Storage',
  'Infrastructure',
] as const;

export const SUBTASK_TYPES = [
  'Backend',
  'Frontend',
  'Testing',
  'DevOps',
  'Docs',
] as const;

export const NfrSchema = z.object({
  category: z.enum(NFR_CATEGORIES),
  title: z.string(),
  description: z.string(),
  impactLevel: z.enum(['Low', 'Medium', 'High']),
});

export const NfrsResponseSchema = z.object({
  nfrs: z.array(NfrSchema),
});

export const CardSummarySchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const CardsResponseSchema = z.object({
  cards: z.array(CardSummarySchema),
});

export const SubtaskSchema = z.object({
  title: z.string(),
  type: z.enum(SUBTASK_TYPES),
  storyPoints: z.number(),
});

export const SmartCardSchema = z.object({
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  subtasks: z.array(SubtaskSchema),
  totalStoryPoints: z.number(),
  justification: z.string(),
  labels: z.array(z.string()),
  risks: z.array(z.string()),
});
