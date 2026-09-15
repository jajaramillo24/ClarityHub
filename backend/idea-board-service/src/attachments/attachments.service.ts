import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  findAll(): Promise<AttachmentSummary[]> {
    return this.prisma.attachment.findMany({
      select: { id: true, name: true, mimeType: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string): Promise<AttachmentWithContent> {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
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

  create(dto: CreateAttachmentDto): Promise<AttachmentSummary> {
    return this.prisma.attachment.create({
      data: {
        name: dto.name,
        mimeType: dto.mimeType,
        data: Buffer.from(dto.base64, 'base64'),
      },
      select: { id: true, name: true, mimeType: true, createdAt: true },
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.attachment.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Attachment ${id} not found`);
      }
      throw error;
    }
  }
}
