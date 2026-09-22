import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string, status?: string) {
    return this.prisma.projectCard.findMany({
      where: status ? { projectId, status } : { projectId },
      include: { subtasks: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, projectId: string) {
    const card = await this.prisma.projectCard.findFirst({
      where: { id, projectId },
      include: { subtasks: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }
    return card;
  }

  create(dto: CreateCardDto, projectId: string) {
    return this.prisma.projectCard.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description ?? '',
        acceptanceCriteria: [],
        justification: '',
        labels: [],
        risks: [],
        status: 'Draft',
      },
      include: { subtasks: true },
    });
  }

  createMany(dtos: CreateCardDto[], projectId: string) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.projectCard.create({
          data: {
            projectId,
            title: dto.title,
            description: dto.description ?? '',
            acceptanceCriteria: [],
            justification: '',
            labels: [],
            risks: [],
            status: 'Draft',
          },
          include: { subtasks: true },
        }),
      ),
    );
  }

  async update(id: string, dto: UpdateCardDto, projectId: string) {
    await this.findOne(id, projectId);
    return this.prisma.projectCard.update({
      where: { id },
      data: dto,
      include: { subtasks: true },
    });
  }

  async remove(id: string, projectId: string): Promise<void> {
    const result = await this.prisma.projectCard.deleteMany({
      where: { id, projectId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Card ${id} not found`);
    }
  }

  async addSubtask(cardId: string, dto: CreateSubtaskDto, projectId: string) {
    await this.findOne(cardId, projectId);
    await this.prisma.subtask.create({
      data: { ...dto, cardId, completed: false },
    });
    return this.findOne(cardId, projectId);
  }

  async updateSubtask(
    cardId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
    projectId: string,
  ) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, cardId, card: { projectId } },
    });
    if (!subtask) {
      throw new NotFoundException(
        `Subtask ${subtaskId} not found on card ${cardId}`,
      );
    }
    await this.prisma.subtask.update({ where: { id: subtaskId }, data: dto });
    return this.findOne(cardId, projectId);
  }

  async removeSubtask(cardId: string, subtaskId: string, projectId: string) {
    const result = await this.prisma.subtask.deleteMany({
      where: { id: subtaskId, cardId, card: { projectId } },
    });
    if (result.count === 0) {
      throw new NotFoundException(
        `Subtask ${subtaskId} not found on card ${cardId}`,
      );
    }
    return this.findOne(cardId, projectId);
  }
}
