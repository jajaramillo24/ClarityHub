import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

export interface AttachmentSummary {
  id: string;
  name: string;
  mimeType: string;
  createdAt: Date;
}

export interface AttachmentWithContent extends AttachmentSummary {
  base64: string;
}

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentsRepository: Repository<Attachment>,
  ) {}

  async findAll(): Promise<AttachmentSummary[]> {
    const attachments = await this.attachmentsRepository.find({
      select: { id: true, name: true, mimeType: true, createdAt: true },
      order: { createdAt: 'ASC' },
    });
    return attachments;
  }

  async findOne(id: string): Promise<AttachmentWithContent> {
    const attachment = await this.attachmentsRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
    return {
      id: attachment.id,
      name: attachment.name,
      mimeType: attachment.mimeType,
      createdAt: attachment.createdAt,
      base64: attachment.data.toString('base64'),
    };
  }

  async create(dto: CreateAttachmentDto): Promise<AttachmentSummary> {
    const attachment = this.attachmentsRepository.create({
      name: dto.name,
      mimeType: dto.mimeType,
      data: Buffer.from(dto.base64, 'base64'),
    });
    const saved = await this.attachmentsRepository.save(attachment);
    return {
      id: saved.id,
      name: saved.name,
      mimeType: saved.mimeType,
      createdAt: saved.createdAt,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.attachmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
  }
}
