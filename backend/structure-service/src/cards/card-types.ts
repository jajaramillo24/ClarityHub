// Small literal-union types shared by the card/subtask DTOs. Used to live as
// exports from the TypeORM entity classes; kept here now that persistence
// went through Prisma, which doesn't type non-enum scalar columns this way.

export type CardStatus = 'Draft' | 'Ready' | 'Exported';
export type SubtaskType = 'Backend' | 'Frontend' | 'Testing' | 'DevOps' | 'Docs';
