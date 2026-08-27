import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subtask } from './subtask.entity';

export type CardStatus = 'Draft' | 'Ready' | 'Exported';

@Entity('project_cards')
export class ProjectCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text', { default: '' })
  description: string;

  @Column('text', { array: true, default: () => "'{}'", name: 'acceptance_criteria' })
  acceptanceCriteria: string[];

  @Column('int', { default: 0, name: 'total_story_points' })
  totalStoryPoints: number;

  @Column('text', { default: '' })
  justification: string;

  @Column('text', { array: true, default: () => "'{}'" })
  labels: string[];

  @Column('text', { array: true, default: () => "'{}'" })
  risks: string[];

  @Column('varchar', { length: 20, default: 'Draft' })
  status: CardStatus;

  @OneToMany(() => Subtask, (subtask) => subtask.card, {
    cascade: true,
    eager: true,
  })
  subtasks: Subtask[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
