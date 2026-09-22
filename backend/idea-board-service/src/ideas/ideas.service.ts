import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.idea.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const idea = await this.prisma.idea.findFirst({ where: { id, ownerId } });
    if (!idea) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
    return idea;
  }

  create(dto: CreateIdeaDto, ownerId: string) {
    return this.prisma.idea.create({
      data: { content: dto.content, category: dto.category ?? null, ownerId },
    });
  }

  async update(id: string, dto: UpdateIdeaDto, ownerId: string) {
    await this.findOne(id, ownerId);
    return this.prisma.idea.update({ where: { id }, data: dto });
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.prisma.idea.deleteMany({
      where: { id, ownerId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
  }
}
