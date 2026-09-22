import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string) {
    return this.prisma.idea.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, projectId: string) {
    const idea = await this.prisma.idea.findFirst({ where: { id, projectId } });
    if (!idea) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
    return idea;
  }

  create(dto: CreateIdeaDto, projectId: string) {
    return this.prisma.idea.create({
      data: { content: dto.content, category: dto.category ?? null, projectId },
    });
  }

  async update(id: string, dto: UpdateIdeaDto, projectId: string) {
    await this.findOne(id, projectId);
    return this.prisma.idea.update({ where: { id }, data: dto });
  }

  async remove(id: string, projectId: string): Promise<void> {
    const result = await this.prisma.idea.deleteMany({
      where: { id, projectId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
  }
}
