import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.projectCard.findMany({
      where: status ? { status } : {},
      include: { subtasks: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const card = await this.prisma.projectCard.findUnique({
      where: { id },
      include: { subtasks: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }
    return card;
  }

  create(dto: CreateCardDto) {
    return this.prisma.projectCard.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        acceptanceCriteria: [],
        labels: [],
        risks: [],
        status: 'Draft',
      },
      include: { subtasks: true },
    });
  }

  createMany(dtos: CreateCardDto[]) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.projectCard.create({
          data: {
            title: dto.title,
            description: dto.description ?? '',
            acceptanceCriteria: [],
            labels: [],
            risks: [],
            status: 'Draft',
          },
          include: { subtasks: true },
        }),
      ),
    );
  }

  async update(id: string, dto: UpdateCardDto) {
    await this.findOne(id);
    return this.prisma.projectCard.update({
      where: { id },
      data: dto as Prisma.ProjectCardUpdateInput,
      include: { subtasks: true },
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.projectCard.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Card ${id} not found`);
      }
      throw error;
    }
  }

  async addSubtask(cardId: string, dto: CreateSubtaskDto) {
    await this.findOne(cardId);
    await this.prisma.subtask.create({
      data: { ...dto, cardId, completed: false },
    });
    return this.findOne(cardId);
  }

  async updateSubtask(cardId: string, subtaskId: string, dto: UpdateSubtaskDto) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, cardId },
    });
    if (!subtask) {
      throw new NotFoundException(`Subtask ${subtaskId} not found on card ${cardId}`);
    }
    await this.prisma.subtask.update({ where: { id: subtaskId }, data: dto });
    return this.findOne(cardId);
  }

  async removeSubtask(cardId: string, subtaskId: string) {
    const result = await this.prisma.subtask.deleteMany({
      where: { id: subtaskId, cardId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Subtask ${subtaskId} not found on card ${cardId}`);
    }
    return this.findOne(cardId);
  }
}
