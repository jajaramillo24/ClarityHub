import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CsvColumn } from '../types';

export type ExportJobStatus = 'pending' | 'completed' | 'failed';

@Entity('export_jobs')
export class ExportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 20, default: 'pending' })
  status: ExportJobStatus;

  @Column('varchar', { length: 1 })
  delimiter: ',' | ';';

  @Column('boolean', { name: 'include_subtasks', default: true })
  includeSubtasks: boolean;

  @Column('jsonb')
  columns: CsvColumn[];

  @Column('int', { name: 'card_count', default: 0 })
  cardCount: number;

  // Kept so a completed job can be re-downloaded without re-querying
  // structure-service, and so a failed job's next retry has something to
  // compare against.
  @Column('text', { name: 'csv_content', nullable: true })
  csvContent: string | null;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
