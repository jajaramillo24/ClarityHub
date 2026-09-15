import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.idea.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) {
    const idea = await this.prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
    return idea;
  }

  create(dto: CreateIdeaDto) {
    return this.prisma.idea.create({
      data: { content: dto.content, category: dto.category ?? null },
    });
  }

  async update(id: string, dto: UpdateIdeaDto) {
    await this.findOne(id);
    return this.prisma.idea.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.idea.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Idea ${id} not found`);
      }
      throw error;
    }
  }
}
