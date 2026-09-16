import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { DocumentProcessorService } from '../documents/document-processor.service';
import { isExcelDocument, isImage, isWordDocument } from '../documents/document-processor.service';
import { withRetry } from './retry.util';
import {
  CardsResponseSchema,
  NfrsResponseSchema,
  SmartCardSchema,
} from './schemas';
import {
  AttachmentRef,
  GenerationOptions,
  Idea,
  NFR,
  ProjectCard,
} from '../types';

const MODEL = 'claude-opus-5';
const MAX_TOKENS = 16000;

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly client: Anthropic;

  constructor(
    private readonly config: ConfigService,
    private readonly documentProcessor: DocumentProcessorService,
  ) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async summarizeIdeas(ideas: Idea[], attachments: AttachmentRef[]): Promise<string> {
    const ideasText = ideas.map((i) => `- ${i.content}`).join('\n');

    let promptText = `You are a Product Engineering Architect.
Analyze the provided context, which includes brainstormed text notes.

Group these concepts into professional Epics or Modules.
Identify functional requirements and potential technical challenges.

Return a clean Markdown report. Do not use emojis.
Write the entire report in Spanish (Latin American Spanish), including all headings, labels, and body text.

Brainstormed Notes:
${ideasText}`;

    const imageBlocks: Anthropic.ImageBlockParam[] = [];

    if (attachments.length > 0) {
      promptText += `\n\nAttached Files (${attachments.length}):\n`;
      for (const file of attachments) {
        if (isWordDocument(file.mimeType, file.name) || isExcelDocument(file.mimeType, file.name)) {
          const extracted = await this.documentProcessor.processAttachment(file);
          promptText += extracted
            ? `\n--- Content from ${file.name} ---\n${extracted}\n`
            : `- ${file.name} (${file.mimeType}) - Could not extract text\n`;
        } else if (isImage(file.mimeType)) {
          imageBlocks.push({
            type: 'image',
            source: { type: 'base64', media_type: file.mimeType as Anthropic.Base64ImageSource['media_type'], data: file.base64 },
          });
        } else {
          promptText += `- ${file.name} (${file.mimeType})\n`;
        }
      }
    }

    const response = await withRetry(() =>
      this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: promptText }, ...imageBlocks],
          },
        ],
      }),
    );

    return this.extractText(response);
  }

  async analyzeRisks(nfrs: NFR[]): Promise<string> {
    const nfrsText = nfrs
      .map((n) => `- [${n.category} - ${n.impactLevel} Priority] ${n.title}: ${n.description}`)
      .join('\n');

    const prompt = `Analyze these Non-Functional Requirements. Return a strictly professional Markdown report identifying conflicts and technical risks. Do not use emojis. Use standard bullet points. Write the entire report in Spanish (Latin American Spanish).\n\n${nfrsText}`;

    const response = await withRetry(() =>
      this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
    );

    return this.extractText(response) || 'No risks identified.';
  }

  async generateNfrsFromSummary(summary: string, ideas: Idea[]): Promise<NFR[]> {
    const ideasText = ideas.map((i) => `- ${i.content}`).join('\n');

    const prompt = `You are a Product Engineering Architect specialized in Non-Functional Requirements.
Based on the executive summary below, identify and extract all Non-Functional Requirements (NFRs).

Categories to consider:
- Security: Authentication, authorization, data protection, encryption
- Performance: Response times, throughput, latency requirements
- Scalability: Growth capacity, load handling, horizontal/vertical scaling
- Accessibility: WCAG compliance, screen readers, keyboard navigation
- Privacy: GDPR, data handling, user consent, data retention
- Reliability: Uptime, fault tolerance, backup/recovery, monitoring
- Storage: Database requirements, data retention, backup strategies
- Infrastructure: Hosting, deployment, CI/CD, cloud services

Original Ideas Context:
${ideasText}

Executive Summary:
${summary}

Generate 3-10 NFRs depending on the summary content. Be specific and actionable.
Number each NFR title sequentially (e.g., "NFR-1: Autenticación", "NFR-2: Tiempo de Respuesta", etc.) —
keep the "NFR-<number>:" prefix in that exact format, but write the rest of the title and the
description in Spanish (Latin American Spanish). Leave the category field as its exact English enum
value (Security, Performance, Scalability, Accessibility, Privacy, Reliability, Storage, Infrastructure) —
the frontend maps that value to a translated label for display.`;

    const response = await withRetry(() =>
      this.client.messages.parse({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
        output_config: { format: zodOutputFormat(NfrsResponseSchema) },
      }),
    );

    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error('Claude did not return a parseable NFR list');
    }

    return parsed.nfrs.map((nfr, index) => ({
      id: `${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
      category: nfr.category,
      title: nfr.title.match(/^NFR-\d+:/) ? nfr.title : `NFR-${index + 1}: ${nfr.title}`,
      description: nfr.description,
      impactLevel: nfr.impactLevel,
    }));
  }

  async generateCardsFromSummary(summary: string, ideas: Idea[], nfrs: NFR[]): Promise<ProjectCard[]> {
    const ideasText = ideas.map((i) => `- ${i.content}`).join('\n');
    const nfrsText = nfrs.map((n) => `[${n.category}] ${n.title}: ${n.description}`).join('\n');

    const prompt = `You are a Product Engineering Architect.
Based on the executive summary below, generate a numbered list of Epic/Feature cards for the product backlog.

Extract all major Epics or Features mentioned in the summary and create a simple enumerated card for each.
Each card should be numbered (e.g., "1. Autenticación de Usuarios", "2. Diseño del Dashboard") and include:
- title: Numbered epic/feature name
- description: Brief 1-2 sentence description of the epic's purpose

Original Ideas Context:
${ideasText}

NFRs Context:
${nfrsText || 'None specified'}

Executive Summary:
${summary}

Generate between 5-12 enumerated epics depending on the summary content. Number each epic sequentially.
Write the title and description in Spanish (Latin American Spanish).`;

    const response = await withRetry(() =>
      this.client.messages.parse({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
        output_config: { format: zodOutputFormat(CardsResponseSchema) },
      }),
    );

    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error('Claude did not return a parseable card list');
    }

    return parsed.cards.map((card) => ({
      title: card.title,
      description: card.description,
      acceptanceCriteria: [],
      subtasks: [],
      totalStoryPoints: 0,
      justification: '',
      labels: [],
      risks: [],
      status: 'Draft' as const,
    }));
  }

  async generateSmartCard(
    title: string,
    ideas: Idea[],
    nfrs: NFR[],
    options: GenerationOptions,
  ): Promise<Partial<ProjectCard>> {
    const ideasText = ideas.map((i) => `- ${i.content}`).join('\n');
    const nfrsText = nfrs
      .map((n) => `- [${n.category} - ${n.impactLevel} Priority] ${n.title}: ${n.description}`)
      .join('\n');

    const scopeInstructions = `SCOPE OF WORK:
- Backend Development: ${options.includeBackend ? 'REQUIRED' : 'EXCLUDED (Do not generate backend tasks)'}
- Frontend Development: ${options.includeFrontend ? 'REQUIRED' : 'EXCLUDED (Do not generate frontend tasks)'}
- Testing/QA: ${options.includeTesting ? 'REQUIRED' : 'EXCLUDED (Do not generate testing tasks)'}
- Documentation: ${options.includeDocs ? 'REQUIRED' : 'EXCLUDED (Do not generate doc tasks)'}`;

    const estimationMode = options.detailedEstimation
      ? `ESTIMATION MODE: DETAILED (Full Production-Ready)
- Include all edge cases, error handling, and comprehensive testing
- Consider security, performance optimization, and full documentation
- Include code review time, integration testing, and deployment preparation
- Add monitoring, logging, and observability tasks
- Plan for technical debt prevention and refactoring needs`
      : `ESTIMATION MODE: MVP RAPIDO (Minimum Viable to Ship)
- Focus on core functionality only, minimal viable implementation
- Basic validation and happy path testing only
- Minimal documentation (just enough to understand)
- Skip advanced optimizations, use simple approaches
- Reduce subtasks to essential ones only
- Aim for "working and shippable" not "perfect"
- Estimates should be 30-50% lower than detailed mode`;

    const prompt = `You are a Senior Technical Product Manager.
Create a detailed technical specification for a Jira issue titled: "${title}".

${scopeInstructions}

${estimationMode}

ESTIMATION RULES (CONSERVATIVE):
- Use Fibonacci sequence (1, 2, 3, 5, 8, 13).
- Be strict and conservative. Do not inflate estimates.
- 1 SP: Trivial text change, config change, or very simple function.
- 2 SP: Simple CRUD operation or UI component without complex logic.
- 3 SP: Standard feature with moderate logic.
- 5 SP: Complex feature involving multiple components or tricky integration.
- 8 SP: Very complex module (consider breaking down if possible).

Context:
${ideasText}

Technical Constraints:
${nfrsText}

Use professional, corporate technical language. Do not use emojis.
Write all free text (description, acceptance criteria, subtask titles, justification, labels, risks)
in Spanish (Latin American Spanish). Leave each subtask's "type" field as its exact English enum value
(Backend, Frontend, Testing, DevOps, or Docs) — the frontend maps that value to a translated label for display.`;

    const response = await withRetry(() =>
      this.client.messages.parse({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
        output_config: { format: zodOutputFormat(SmartCardSchema) },
      }),
    );

    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error('Claude did not return a parseable card specification');
    }

    return {
      ...parsed,
      subtasks: parsed.subtasks.map((s) => ({ ...s, completed: false })),
    };
  }

  private extractText(response: Anthropic.Message): string {
    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  }
}
