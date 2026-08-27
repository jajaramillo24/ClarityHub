import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type NfrImpactLevel = 'Low' | 'Medium' | 'High';

@Entity('nfrs')
export class Nfr {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  category: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text', { default: '' })
  description: string;

  @Column('varchar', { length: 10, name: 'impact_level' })
  impactLevel: NfrImpactLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
