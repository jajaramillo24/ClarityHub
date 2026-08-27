import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 150, name: 'mime_type' })
  mimeType: string;

  // Raw file bytes, decoded from the base64 payload the frontend sends.
  @Column('bytea')
  data: Buffer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
