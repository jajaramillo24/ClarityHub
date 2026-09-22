import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string): Promise<AttachmentSummary[]> {
    return this.prisma.attachment.findMany({
      where: { ownerId },
      select: { id: true, name: true, mimeType: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, ownerId: string): Promise<AttachmentWithContent> {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id, ownerId },
    });
    if (!attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
    return {
      id: attachment.id,
      name: attachment.name,
      mimeType: attachment.mimeType,
      createdAt: attachment.createdAt,
      base64: Buffer.from(attachment.data).toString('base64'),
    };
  }

  create(
    dto: CreateAttachmentDto,
    ownerId: string,
  ): Promise<AttachmentSummary> {
    return this.prisma.attachment.create({
      data: {
        name: dto.name,
        mimeType: dto.mimeType,
        data: Buffer.from(dto.base64, 'base64'),
        ownerId,
      },
      select: { id: true, name: true, mimeType: true, createdAt: true },
    });
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.prisma.attachment.deleteMany({
      where: { id, ownerId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
  }
}
