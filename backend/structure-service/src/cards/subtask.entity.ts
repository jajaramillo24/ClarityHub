import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectCard } from './project-card.entity';

export type SubtaskType = 'Backend' | 'Frontend' | 'Testing' | 'DevOps' | 'Docs';

@Entity('subtasks')
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 20 })
  type: SubtaskType;

  @Column('int', { name: 'story_points' })
  storyPoints: number;

  @Column('boolean', { default: false })
  completed: boolean;

  @ManyToOne(() => ProjectCard, (card) => card.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: ProjectCard;

  @Column('uuid', { name: 'card_id' })
  cardId: string;
}
