import { CsvColumn, ProjectCard } from '../types';

export const DEFAULT_COLUMNS: CsvColumn[] = [
  { id: '1', header: 'Summary', field: 'title', enabled: true },
  { id: '2', header: 'Description', field: 'description', enabled: true },
  { id: '3', header: 'Issue Type', field: 'issue_type', enabled: true },
  { id: '4', header: 'Priority', field: 'priority', enabled: true },
  { id: '5', header: 'Story Points', field: 'totalStoryPoints', enabled: true },
  { id: '6', header: 'Labels', field: 'labels', enabled: true },
  { id: '7', header: 'Assignee', field: 'assignee', enabled: false },
  { id: '8', header: 'Parent ID', field: 'parent_id', enabled: false },
  { id: '9', header: 'Acceptance Criteria', field: 'acceptanceCriteria', enabled: true },
  { id: '10', header: 'Risks', field: 'risks', enabled: true },
];

const escapeCsv = (value: string, delimiter: string): string =>
  `"${value.replace(/"/g, '""')}"`;

const priorityFromStoryPoints = (points: number): 'High' | 'Medium' | 'Low' =>
  points > 13 ? 'High' : points > 5 ? 'Medium' : 'Low';

/**
 * Ported 1:1 from the frontend's ExportManagerView.downloadCsv — same
 * column semantics, same parent/subtask row shape, so existing Jira import
 * mappings a user has already set up keep working unchanged.
 */
export function generateJiraCsv(
  cards: ProjectCard[],
  options: { delimiter: ',' | ';'; includeSubtasks: boolean; columns: CsvColumn[] },
): string {
  const { delimiter, includeSubtasks, columns } = options;
  const enabledCols = columns.filter((c) => c.enabled);
  const headerRow = enabledCols.map((c) => `"${c.header}"`).join(delimiter);

  const allRows: string[] = [];

  for (const card of cards) {
    const parentRow = enabledCols
      .map((col) => {
        let val = '';
        switch (col.field) {
          case 'issue_type':
            val = 'Story';
            break;
          case 'priority':
            val = priorityFromStoryPoints(card.totalStoryPoints);
            break;
          case 'labels':
            val = card.labels.join(', ');
            break;
          case 'assignee':
            val = '';
            break;
          case 'parent_id':
            val = '';
            break;
          case 'acceptanceCriteria':
            val = card.acceptanceCriteria.join('\n');
            break;
          case 'risks':
            val = card.risks.join('\n');
            break;
          case 'subtasks_count':
            val = card.subtasks.length.toString();
            break;
          default:
            val = String((card as unknown as Record<string, unknown>)[col.field] ?? '');
        }
        return escapeCsv(val, delimiter);
      })
      .join(delimiter);

    allRows.push(parentRow);

    if (includeSubtasks && card.subtasks.length > 0) {
      for (const subtask of card.subtasks) {
        const subtaskRow = enabledCols
          .map((col) => {
            let val = '';
            switch (col.field) {
              case 'title':
                val = subtask.title;
                break;
              case 'description':
                val = `${subtask.type} subtask for: ${card.title}`;
                break;
              case 'issue_type':
                val = 'Sub-task';
                break;
              case 'priority':
                val = 'Medium';
                break;
              case 'totalStoryPoints':
                val = subtask.storyPoints.toString();
                break;
              case 'labels':
                val = `${subtask.type}, Subtask`;
                break;
              case 'assignee':
                val = '';
                break;
              case 'parent_id':
                val = card.title;
                break;
              default:
                val = '';
            }
            return escapeCsv(val, delimiter);
          })
          .join(delimiter);
        allRows.push(subtaskRow);
      }
    }
  }

  return `${headerRow}\n${allRows.join('\n')}`;
}
