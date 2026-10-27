import React, { useState, useMemo } from 'react';
import { ProjectCard, Subtask, IssueType, Priority, KanbanColumnId } from './types';

interface KanbanBoardViewProps {
  cards: ProjectCard[];
  setCards: React.Dispatch<React.SetStateAction<ProjectCard[]>> | ((cards: ProjectCard[]) => void);
  onNavigateToExport?: () => void;
}

const COLUMNS: { id: KanbanColumnId; label: string; accentColor: string; bgBadge: string }[] = [
  { id: 'To Do', label: 'To Do', accentColor: 'border-blue-500/40 text-blue-400', bgBadge: 'bg-blue-500/10' },
  { id: 'In Progress', label: 'In Progress', accentColor: 'border-amber-500/40 text-amber-400', bgBadge: 'bg-amber-500/10' },
  { id: 'In Review', label: 'In Review', accentColor: 'border-purple-500/40 text-purple-400', bgBadge: 'bg-purple-500/10' },
  { id: 'Done', label: 'Done', accentColor: 'border-emerald-500/40 text-emerald-400', bgBadge: 'bg-emerald-500/10' },
];

const SAMPLE_USERS = [
  { name: 'Juan Jaramillo', initials: 'JJ', color: 'bg-indigo-600' },
  { name: 'Alex Morgan', initials: 'AM', color: 'bg-blue-600' },
  { name: 'Sofia Chen', initials: 'SC', color: 'bg-emerald-600' },
  { name: 'David Kim', initials: 'DK', color: 'bg-purple-600' },
  { name: 'Elena Rostova', initials: 'ER', color: 'bg-pink-600' },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({ cards, setCards, onNavigateToExport }) => {
  // --- View State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<IssueType | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');

  // Active dragging card ID
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnId | null>(null);

  // Active detail modal card
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Create issue modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createColumnTarget, setCreateColumnTarget] = useState<KanbanColumnId>('To Do');
  const [newIssueForm, setNewIssueForm] = useState<{
    title: string;
    description: string;
    issueType: IssueType;
    priority: Priority;
    assignee: string;
    storyPoints: number;
    labelsText: string;
  }>({
    title: '',
    description: '',
    issueType: 'Story',
    priority: 'Medium',
    assignee: 'Juan Jaramillo',
    storyPoints: 3,
    labelsText: 'frontend, core',
  });

  // Map arbitrary card status into the 4 kanban columns
  const getCardColumn = (card: ProjectCard): KanbanColumnId => {
    const s = card.status;
    if (s === 'In Progress') return 'In Progress';
    if (s === 'In Review') return 'In Review';
    if (s === 'Done' || s === 'Exported') return 'Done';
    return 'To Do';
  };

  // Ensure card has Jira-style key
  const getCardKey = (card: ProjectCard, index: number): string => {
    if (card.key) return card.key;
    const shortId = card.id.length > 4 ? card.id.slice(-4) : (100 + index).toString();
    return `CLR-${shortId}`;
  };

  // Helper to update one card
  const updateCard = (cardId: string, updates: Partial<ProjectCard>) => {
    setCards(cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)));
  };

  // Move card directly to another column
  const handleMoveColumn = (cardId: string, targetCol: KanbanColumnId) => {
    updateCard(cardId, { status: targetCol });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingCardId(cardId);
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, colId: KanbanColumnId) => {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: KanbanColumnId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggingCardId;
    if (cardId) {
      handleMoveColumn(cardId, colId);
    }
    setDraggingCardId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDragOverColumn(null);
  };

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(q);
        const matchesDesc = (card.description || '').toLowerCase().includes(q);
        const matchesKey = (card.key || '').toLowerCase().includes(q);
        const matchesLabels = (card.labels || []).some((l) => l.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesKey && !matchesLabels) return false;
      }

      // Filter by type
      if (filterType !== 'ALL') {
        const type = card.issueType || 'Story';
        if (type !== filterType) return false;
      }

      // Filter by priority
      if (filterPriority !== 'ALL') {
        const priority = card.priority || 'Medium';
        if (priority !== filterPriority) return false;
      }

      // Filter by assignee
      if (filterAssignee !== 'ALL') {
        if (filterAssignee === 'UNASSIGNED') {
          if (card.assignee) return false;
        } else {
          if (card.assignee !== filterAssignee) return false;
        }
      }

      return true;
    });
  }, [cards, searchQuery, filterType, filterPriority, filterAssignee]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalIssues = cards.length;
    const totalSP = cards.reduce((acc, c) => acc + (c.totalStoryPoints || 0), 0);
    const doneCards = cards.filter((c) => getCardColumn(c) === 'Done');
    const doneSP = doneCards.reduce((acc, c) => acc + (c.totalStoryPoints || 0), 0);
    const progressPercent = totalSP > 0 ? Math.round((doneSP / totalSP) * 100) : 0;
    return { totalIssues, totalSP, doneCardsCount: doneCards.length, doneSP, progressPercent };
  }, [cards]);

  // Handle Create Issue
  const handleCreateIssue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newIssueForm.title.trim()) return;

    const newId = Date.now().toString();
    const newLabels = newIssueForm.labelsText
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const newCard: ProjectCard = {
      id: newId,
      key: `CLR-${Math.floor(100 + Math.random() * 900)}`,
      title: newIssueForm.title,
      description: newIssueForm.description,
      status: createColumnTarget,
      issueType: newIssueForm.issueType,
      priority: newIssueForm.priority,
      assignee: newIssueForm.assignee,
      totalStoryPoints: Number(newIssueForm.storyPoints) || 1,
      acceptanceCriteria: ['Must satisfy technical constraints', 'Passes unit and integration tests'],
      subtasks: [
        { title: 'Implementation & Logic', type: 'Backend', storyPoints: Math.max(1, Math.floor(newIssueForm.storyPoints / 2)), completed: false },
        { title: 'UI / UX Integration', type: 'Frontend', storyPoints: Math.max(1, Math.ceil(newIssueForm.storyPoints / 2)), completed: false },
      ],
      justification: 'Critical feature for the current milestone',
      labels: newLabels.length > 0 ? newLabels : ['sprint-1'],
      risks: [],
    };

    setCards([...cards, newCard]);
    setIsCreateModalOpen(false);
    setNewIssueForm({
      title: '',
      description: '',
      issueType: 'Story',
      priority: 'Medium',
      assignee: 'Juan Jaramillo',
      storyPoints: 3,
      labelsText: 'core, api',
    });
  };

  // Populate sample cards if empty or requested
  const handleLoadSampleSprint = () => {
    const sampleCards: ProjectCard[] = [
      {
        id: 'sample-1',
        key: 'CLR-101',
        title: 'Authentication & Session Refresh Flow',
        description: 'Implement JWT refresh token mechanism with secure httpOnly cookie handling and automatic silent renewal.',
        status: 'In Progress',
        issueType: 'Story',
        priority: 'Highest',
        assignee: 'Juan Jaramillo',
        totalStoryPoints: 5,
        acceptanceCriteria: [
          'Access tokens expire after 15 minutes',
          'Refresh token endpoint rotates tokens upon each call',
          'Graceful fallback to login screen when refresh fails',
        ],
        subtasks: [
          { title: 'Backend JWT interceptor', type: 'Backend', storyPoints: 2, completed: true },
          { title: 'Frontend auth context & silent refresh', type: 'Frontend', storyPoints: 2, completed: false },
          { title: 'Unit tests for token rotation', type: 'Testing', storyPoints: 1, completed: false },
        ],
        justification: 'Security requirement and compliance baseline.',
        labels: ['auth', 'security', 'backend'],
        risks: ['Race conditions during multiple concurrent expired requests'],
      },
      {
        id: 'sample-2',
        key: 'CLR-102',
        title: 'Real-time Backlog Export to Jira and CSV',
        description: 'Allow users to configure custom delimiter, map parent-child issue relationships, and download formatted Jira CSV.',
        status: 'Done',
        issueType: 'Story',
        priority: 'High',
        assignee: 'Sofia Chen',
        totalStoryPoints: 3,
        acceptanceCriteria: [
          'Export includes Summary, Issue Type, Priority, Story Points, and Subtasks',
          'Supports semicolon and comma delimiters',
          'Compatible with standard Jira Cloud importer',
        ],
        subtasks: [
          { title: 'CSV serialization utility', type: 'Frontend', storyPoints: 2, completed: true },
          { title: 'Export configuration dialog', type: 'Frontend', storyPoints: 1, completed: true },
        ],
        justification: 'High user demand for syncing ClarityHub specs directly into Jira.',
        labels: ['export', 'jira'],
        risks: [],
      },
      {
        id: 'sample-3',
        key: 'CLR-103',
        title: 'Fix drag-and-drop flickering on mobile Safari',
        description: 'Touch event listeners fail to properly bind during column transitions on touch devices.',
        status: 'In Review',
        issueType: 'Bug',
        priority: 'High',
        assignee: 'Alex Morgan',
        totalStoryPoints: 2,
        acceptanceCriteria: [
          'Smooth drag preview on iOS 17 Safari',
          'Drop triggers column update with vibration feedback if supported',
        ],
        subtasks: [
          { title: 'Add touchmove preventDefault', type: 'Frontend', storyPoints: 1, completed: true },
          { title: 'Cross-browser testing on WebKit', type: 'Testing', storyPoints: 1, completed: true },
        ],
        justification: 'Reported by QA during mobile audit.',
        labels: ['bug', 'mobile', 'touch'],
        risks: [],
      },
      {
        id: 'sample-4',
        key: 'CLR-104',
        title: 'CI/CD Automated Deployment to Render & Cloud',
        description: 'Configure multi-stage Docker builds, health-checks, and staging promotion pipeline in GitHub Actions.',
        status: 'To Do',
        issueType: 'Task',
        priority: 'Medium',
        assignee: 'David Kim',
        totalStoryPoints: 5,
        acceptanceCriteria: [
          'Automated tests run on PR',
          'Docker image published to registry on main branch merge',
          'Zero-downtime rolling deploy configured',
        ],
        subtasks: [
          { title: 'Dockerfile optimization', type: 'DevOps', storyPoints: 2, completed: false },
          { title: 'GitHub Actions workflow script', type: 'DevOps', storyPoints: 2, completed: false },
          { title: 'Healthcheck endpoint verification', type: 'Testing', storyPoints: 1, completed: false },
        ],
        justification: 'Required for reproducible production environments.',
        labels: ['devops', 'docker', 'ci-cd'],
        risks: ['Deployment secrets rotation coordination'],
      },
      {
        id: 'sample-5',
        key: 'CLR-105',
        title: 'Architecture & Design System Epic: Clarity v3.0',
        description: 'Global glassmorphism visual overhaul, Dark Mode refinement, and accessible keyboard navigation for all boards.',
        status: 'To Do',
        issueType: 'Epic',
        priority: 'Medium',
        assignee: 'Elena Rostova',
        totalStoryPoints: 8,
        acceptanceCriteria: [
          'Full WCAG AA color contrast compliance',
          'Unified design tokens for borders, surfaces, and typography',
        ],
        subtasks: [
          { title: 'Token design specification', type: 'Docs', storyPoints: 2, completed: false },
          { title: 'Component refactor', type: 'Frontend', storyPoints: 4, completed: false },
          { title: 'Accessibility automated audit', type: 'Testing', storyPoints: 2, completed: false },
        ],
        justification: 'Product visual identity upgrade.',
        labels: ['design-system', 'epic', 'a11y'],
        risks: [],
      },
    ];

    setCards(sampleCards);
  };

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) || null,
    [cards, selectedCardId]
  );

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-gray-100 overflow-hidden relative select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-clarity-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP BAR / JIRA HEADER */}
      <header className="p-4 lg:px-6 border-b border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-3 relative z-10 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-clarity-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-clarity-500/25">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M8 7v7" />
                <path d="M12 7v4" />
                <path d="M16 7v10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Sprint Kanban Board
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Sprint 1
                  </span>
                </h1>
              </div>
              <p className="text-xs text-gray-400">
                Drag and drop issues across workflow stages or edit detailed acceptance criteria & story points
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {cards.length === 0 && (
              <button
                onClick={handleLoadSampleSprint}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-clarity-300 border border-clarity-500/30 flex items-center gap-2 transition-all hover:border-clarity-500/60"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Load Sample Sprint
              </button>
            )}

            {cards.length > 0 && (
              <button
                onClick={handleLoadSampleSprint}
                title="Reset or reload demo sprint issues"
                className="px-2.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Reset Demo
              </button>
            )}

            <button
              onClick={() => {
                setCreateColumnTarget('To Do');
                setIsCreateModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-clarity-600 hover:bg-clarity-500 text-white shadow-lg shadow-clarity-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Issue
            </button>
          </div>
        </div>

        {/* METRICS & QUICK FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search issues, keys, labels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-clarity-500 focus:bg-white/10 transition-colors"
              />
              <svg
                className="absolute left-2.5 top-2 text-gray-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Type:</span>
            {(['ALL', 'Story', 'Task', 'Bug', 'Epic'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  filterType === t
                    ? 'bg-clarity-500/20 text-clarity-300 border border-clarity-500/40'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-clarity-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Assignee:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-clarity-500"
            >
              <option value="ALL">All Assignees</option>
              {SAMPLE_USERS.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name}
                </option>
              ))}
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>

          {/* Sprint Velocity / SP Stats */}
          <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[11px]">Sprint Progress:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {metrics.doneSP} / {metrics.totalSP} SP
              </span>
            </div>
            <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-clarity-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${metrics.progressPercent}%` }}
              ></div>
            </div>
            <span className="font-mono text-[10px] text-gray-400">{metrics.progressPercent}%</span>
          </div>
        </div>
      </header>

      {/* KANBAN BOARD COLUMNS CONTAINER */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-6">
        <div className="flex gap-4 h-full min-w-[1000px]">
          {COLUMNS.map((col) => {
            const columnCards = filteredCards.filter((card) => getCardColumn(card) === col.id);
            const columnSP = columnCards.reduce((acc, c) => acc + (c.totalStoryPoints || 0), 0);
            const isDragTarget = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-1 flex flex-col rounded-2xl bg-black/25 backdrop-blur-md border transition-all duration-200 overflow-hidden ${
                  isDragTarget
                    ? 'border-clarity-500 shadow-lg shadow-clarity-500/20 bg-clarity-950/20 ring-2 ring-clarity-500/40'
                    : 'border-white/10'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 px-4 border-b border-white/10 flex items-center justify-between bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full border ${col.accentColor} bg-current`}></span>
                    <h3 className="font-semibold text-xs tracking-wider uppercase text-white/90">
                      {col.label}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold text-gray-300 ${col.bgBadge}`}>
                      {columnCards.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {columnSP} SP
                    </span>
                    <button
                      onClick={() => {
                        setCreateColumnTarget(col.id);
                        setIsCreateModalOpen(true);
                      }}
                      title={`Add issue to ${col.label}`}
                      className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Cards List in Column */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnCards.length === 0 && (
                    <div
                      onClick={() => {
                        setCreateColumnTarget(col.id);
                        setIsCreateModalOpen(true);
                      }}
                      className="h-32 border-2 border-dashed border-white/5 hover:border-white/20 rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors group"
                    >
                      <p className="text-xs text-gray-500 group-hover:text-gray-300 font-medium">
                        No issues in {col.label}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">Drop a card here or click + to create</p>
                    </div>
                  )}

                  {columnCards.map((card, idx) => {
                    const cardKey = getCardKey(card, idx);
                    const isDragging = draggingCardId === card.id;
                    const issueType = card.issueType || 'Story';
                    const priority = card.priority || 'Medium';
                    const completedSubtasks = (card.subtasks || []).filter((s) => s.completed).length;
                    const totalSubtasks = (card.subtasks || []).length;
                    const assigneeUser = SAMPLE_USERS.find((u) => u.name === card.assignee) || {
                      name: card.assignee || 'Unassigned',
                      initials: card.assignee ? card.assignee.slice(0, 2).toUpperCase() : '?',
                      color: 'bg-gray-700',
                    };

                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`p-3.5 rounded-xl border bg-black/40 hover:bg-white/[0.04] backdrop-blur-md transition-all duration-150 cursor-grab active:cursor-grabbing group relative ${
                          isDragging
                            ? 'opacity-40 scale-95 border-clarity-500'
                            : 'border-white/10 hover:border-white/25 hover:shadow-xl hover:shadow-black/60'
                        }`}
                      >
                        {/* Top row: Type icon + Key + Quick Move Action */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            {/* Jira-style Issue Type Badge */}
                            <IssueTypeBadge type={issueType} />
                            <span className="font-mono text-[11px] font-semibold text-gray-400 group-hover:text-clarity-300 transition-colors">
                              {cardKey}
                            </span>
                          </div>

                          {/* Quick Column Switch Dropdown (accessible alternative to drag & drop) */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={col.id}
                              onChange={(e) => handleMoveColumn(card.id, e.target.value as KanbanColumnId)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 border border-white/20 text-[10px] text-gray-300 rounded px-1.5 py-0.5 focus:outline-none"
                              title="Move to column"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="In Review">In Review</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-gray-100 group-hover:text-white leading-snug line-clamp-2 mb-1.5">
                          {card.title}
                        </h4>

                        {/* Description snippet */}
                        {card.description && (
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">
                            {card.description}
                          </p>
                        )}

                        {/* Labels / Tags */}
                        {card.labels && card.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {card.labels.slice(0, 3).map((lbl, lIdx) => (
                              <span
                                key={lIdx}
                                className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10"
                              >
                                {lbl}
                              </span>
                            ))}
                            {card.labels.length > 3 && (
                              <span className="text-[9px] text-gray-500 font-mono self-center">
                                +{card.labels.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Subtasks Progress */}
                        {totalSubtasks > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              <span>Subtasks</span>
                              <span className="font-mono">
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full rounded-full transition-all"
                                style={{
                                  width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Footer: Priority + Story Points + Assignee Avatar */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            {/* Priority Icon */}
                            <PriorityIndicator priority={priority} />

                            {/* Story Points Badge */}
                            {(card.totalStoryPoints || 0) > 0 && (
                              <span
                                className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-clarity-500/20 text-clarity-300 border border-clarity-500/30"
                                title="Story Points"
                              >
                                {card.totalStoryPoints} SP
                              </span>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          <div
                            className={`w-5 h-5 rounded-full ${assigneeUser.color} text-white flex items-center justify-center text-[9px] font-bold shadow`}
                            title={`Assignee: ${assigneeUser.name}`}
                          >
                            {assigneeUser.initials}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: CREATE ISSUE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-xl bg-gray-900 border border-white/20 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-clarity-600 flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Create New Jira Issue</h3>
                  <p className="text-[11px] text-gray-400">Add user stories, tasks, bugs or epics directly to the board</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Summary / Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="e.g. Implement OAuth2 Google Login flow"
                  value={newIssueForm.title}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-clarity-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed technical context, acceptance notes, or requirements..."
                  value={newIssueForm.description}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-clarity-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Issue Type</label>
                  <select
                    value={newIssueForm.issueType}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, issueType: e.target.value as IssueType })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-clarity-500"
                  >
                    <option value="Story">Story</option>
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                    <option value="Epic">Epic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Priority</label>
                  <select
                    value={newIssueForm.priority}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, priority: e.target.value as Priority })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-clarity-500"
                  >
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Story Points</label>
                  <select
                    value={newIssueForm.storyPoints}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, storyPoints: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-clarity-500"
                  >
                    {[1, 2, 3, 5, 8, 13, 21].map((sp) => (
                      <option key={sp} value={sp}>
                        {sp} SP
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Initial Status</label>
                  <select
                    value={createColumnTarget}
                    onChange={(e) => setCreateColumnTarget(e.target.value as KanbanColumnId)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-clarity-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Assignee</label>
                  <select
                    value={newIssueForm.assignee}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, assignee: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-clarity-500"
                  >
                    {SAMPLE_USERS.map((u) => (
                      <option key={u.name} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Labels (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="frontend, auth, critical"
                    value={newIssueForm.labelsText}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, labelsText: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-clarity-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-clarity-600 hover:bg-clarity-500 text-white shadow-lg shadow-clarity-600/30 transition-all"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JIRA ISSUE DETAIL & QUICK EDIT */}
      {selectedCard && (
        <IssueDetailModal
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
          onUpdate={(updates) => updateCard(selectedCard.id, updates)}
          onDelete={() => {
            if (confirm(`Delete issue "${selectedCard.title}"?`)) {
              setCards(cards.filter((c) => c.id !== selectedCard.id));
              setSelectedCardId(null);
            }
          }}
        />
      )}
    </div>
  );
};

// --- ISSUE DETAIL MODAL COMPONENT (Jira-style sidebar + body) ---
interface IssueDetailModalProps {
  card: ProjectCard;
  onClose: () => void;
  onUpdate: (updates: Partial<ProjectCard>) => void;
  onDelete: () => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ card, onClose, onUpdate, onDelete }) => {
  const [newCriteriaText, setNewCriteriaText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskType, setNewSubtaskType] = useState<Subtask['type']>('Backend');
  const [newSubtaskSP, setNewSubtaskSP] = useState(1);

  const cardKey = card.key || `CLR-${card.id.slice(-4)}`;

  // Handle Criteria
  const handleToggleCriteria = (idx: number) => {
    // We can prefix completed criteria or toggle
    const current = card.acceptanceCriteria[idx];
    const isDone = current.startsWith('✓ ');
    const updated = isDone ? current.replace('✓ ', '') : `✓ ${current}`;
    const newCriteria = [...card.acceptanceCriteria];
    newCriteria[idx] = updated;
    onUpdate({ acceptanceCriteria: newCriteria });
  };

  const handleAddCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriteriaText.trim()) return;
    onUpdate({
      acceptanceCriteria: [...card.acceptanceCriteria, newCriteriaText.trim()],
    });
    setNewCriteriaText('');
  };

  const handleRemoveCriteria = (idx: number) => {
    onUpdate({
      acceptanceCriteria: card.acceptanceCriteria.filter((_, i) => i !== idx),
    });
  };

  // Handle Subtasks
  const handleToggleSubtask = (idx: number) => {
    const newSubtasks = [...card.subtasks];
    newSubtasks[idx] = { ...newSubtasks[idx], completed: !newSubtasks[idx].completed };
    onUpdate({ subtasks: newSubtasks });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newTask: Subtask = {
      title: newSubtaskTitle.trim(),
      type: newSubtaskType,
      storyPoints: Number(newSubtaskSP) || 1,
      completed: false,
    };
    onUpdate({
      subtasks: [...card.subtasks, newTask],
      totalStoryPoints: (card.totalStoryPoints || 0) + newTask.storyPoints,
    });
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (idx: number) => {
    const removed = card.subtasks[idx];
    onUpdate({
      subtasks: card.subtasks.filter((_, i) => i !== idx),
      totalStoryPoints: Math.max(0, (card.totalStoryPoints || 0) - (removed ? removed.storyPoints : 0)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0c1222] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="p-4 px-6 border-b border-white/10 bg-black/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <IssueTypeBadge type={card.issueType || 'Story'} />
            <span className="font-mono text-xs font-bold text-gray-400">{cardKey}</span>
            <div className="h-4 w-[1px] bg-white/10"></div>
            {/* Column / Status Pill */}
            <select
              value={card.status}
              onChange={(e) => onUpdate({ status: e.target.value as any })}
              className="bg-clarity-900/40 border border-clarity-500/30 text-clarity-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete issue"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MODAL BODY: Two columns (Main content + Details sidebar) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: Main Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Title editable */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Summary / Title
              </label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-clarity-500 focus:outline-none py-1 transition-colors"
                placeholder="Issue title..."
              />
            </div>

            {/* Description editable */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={card.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Add issue description or markdown specification..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-clarity-500 resize-y leading-relaxed"
              />
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <span>Acceptance Criteria</span>
                  <span className="text-gray-400 font-mono">({card.acceptanceCriteria.length})</span>
                </label>
              </div>

              <div className="space-y-2">
                {card.acceptanceCriteria.map((crit, idx) => {
                  const isChecked = crit.startsWith('✓ ');
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 group"
                    >
                      <button
                        onClick={() => handleToggleCriteria(idx)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`text-xs flex-1 ${
                          isChecked ? 'line-through text-gray-500' : 'text-gray-200'
                        }`}
                      >
                        {crit.replace('✓ ', '')}
                      </span>
                      <button
                        onClick={() => handleRemoveCriteria(idx)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add criteria form */}
              <form onSubmit={handleAddCriteria} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add acceptance criteria..."
                  value={newCriteriaText}
                  onChange={(e) => setNewCriteriaText(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-clarity-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Subtasks breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <span>Subtasks / Technical Breakdown</span>
                  <span className="text-gray-400 font-mono">
                    ({card.subtasks.filter((s) => s.completed).length}/{card.subtasks.length})
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                {card.subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleSubtask(idx)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          st.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {st.completed && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`text-xs truncate ${
                          st.completed ? 'line-through text-gray-500' : 'text-gray-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                        {st.type}
                      </span>
                      <span className="text-[9px] font-mono text-clarity-300 bg-clarity-500/10 px-1.5 py-0.5 rounded">
                        {st.storyPoints} SP
                      </span>
                      <button
                        onClick={() => handleRemoveSubtask(idx)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add subtask */}
              <form onSubmit={handleAddSubtask} className="flex flex-wrap gap-2 pt-1">
                <input
                  type="text"
                  placeholder="New subtask title..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-clarity-500"
                />
                <select
                  value={newSubtaskType}
                  onChange={(e) => setNewSubtaskType(e.target.value as any)}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300"
                >
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Testing">Testing</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Docs">Docs</option>
                </select>
                <select
                  value={newSubtaskSP}
                  onChange={(e) => setNewSubtaskSP(Number(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300"
                >
                  {[1, 2, 3, 5, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} SP
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-clarity-600 hover:bg-clarity-500 text-white"
                >
                  Add Subtask
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Metadata Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-black/30 p-6 space-y-5 overflow-y-auto custom-scrollbar flex-shrink-0">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Issue Details
            </h4>

            {/* Issue Type */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Issue Type</label>
              <select
                value={card.issueType || 'Story'}
                onChange={(e) => onUpdate({ issueType: e.target.value as IssueType })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-clarity-500"
              >
                <option value="Story">Story</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Epic">Epic</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Priority</label>
              <select
                value={card.priority || 'Medium'}
                onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-clarity-500"
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Assignee</label>
              <select
                value={card.assignee || 'Juan Jaramillo'}
                onChange={(e) => onUpdate({ assignee: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-clarity-500"
              >
                {SAMPLE_USERS.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Story Points</label>
              <select
                value={card.totalStoryPoints || 1}
                onChange={(e) => onUpdate({ totalStoryPoints: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-clarity-500"
              >
                {[1, 2, 3, 5, 8, 13, 21].map((sp) => (
                  <option key={sp} value={sp}>
                    {sp} Story Points
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Labels</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((l, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1"
                  >
                    {l}
                    <button
                      onClick={() => onUpdate({ labels: card.labels.filter((_, idx) => idx !== i) })}
                      className="text-gray-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add label & press Enter"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-clarity-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.currentTarget.value || '').trim();
                    if (val && !card.labels.includes(val)) {
                      onUpdate({ labels: [...card.labels, val] });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>

            {/* Justification & Risks summary */}
            {card.justification && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400">
                <span className="font-semibold text-gray-300 block mb-1">Business Value:</span>
                {card.justification}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER JIRA-LIKE COMPONENTS ---

// Issue Type Icon & Badge
const IssueTypeBadge: React.FC<{ type: IssueType }> = ({ type }) => {
  switch (type) {
    case 'Bug':
      return (
        <span className="w-4 h-4 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold border border-red-500/30" title="Bug">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </span>
      );
    case 'Task':
      return (
        <span className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/30" title="Task">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      );
    case 'Epic':
      return (
        <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold border border-purple-500/30" title="Epic">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </span>
      );
    case 'Story':
    default:
      return (
        <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/30" title="Story">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <rect width="18" height="18" x="3" y="3" rx="2" />
          </svg>
        </span>
      );
  }
};

// Priority Indicator
const PriorityIndicator: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'Highest':
      return (
        <span className="text-red-400 flex items-center gap-0.5 text-[10px] font-bold" title="Highest Priority">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span className="text-[9px]">P1</span>
        </span>
      );
    case 'High':
      return (
        <span className="text-amber-400 flex items-center gap-0.5 text-[10px] font-bold" title="High Priority">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span className="text-[9px]">P2</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="text-yellow-400 flex items-center gap-0.5 text-[10px] font-bold" title="Medium Priority">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-[9px]">P3</span>
        </span>
      );
    case 'Low':
      return (
        <span className="text-blue-400 flex items-center gap-0.5 text-[10px] font-bold" title="Low Priority">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="text-[9px]">P4</span>
        </span>
      );
    case 'Lowest':
    default:
      return (
        <span className="text-gray-400 flex items-center gap-0.5 text-[10px] font-bold" title="Lowest Priority">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="text-[9px]">P5</span>
        </span>
      );
  }
};
