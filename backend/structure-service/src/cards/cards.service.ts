import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string, status?: string) {
    return this.prisma.projectCard.findMany({
      where: status ? { ownerId, status } : { ownerId },
      include: { subtasks: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const card = await this.prisma.projectCard.findFirst({
      where: { id, ownerId },
      include: { subtasks: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }
    return card;
  }

  create(dto: CreateCardDto, ownerId: string) {
    return this.prisma.projectCard.create({
      data: {
        ownerId,
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

  createMany(dtos: CreateCardDto[], ownerId: string) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.projectCard.create({
          data: {
            ownerId,
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

  async update(id: string, dto: UpdateCardDto, ownerId: string) {
    await this.findOne(id, ownerId);
    return this.prisma.projectCard.update({
      where: { id },
      data: dto,
      include: { subtasks: true },
    });
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.prisma.projectCard.deleteMany({
      where: { id, ownerId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Card ${id} not found`);
    }
  }

  async addSubtask(cardId: string, dto: CreateSubtaskDto, ownerId: string) {
    await this.findOne(cardId, ownerId);
    await this.prisma.subtask.create({
      data: { ...dto, cardId, completed: false },
    });
    return this.findOne(cardId, ownerId);
  }

  async updateSubtask(
    cardId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
    ownerId: string,
  ) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, cardId, card: { ownerId } },
    });
    if (!subtask) {
      throw new NotFoundException(
        `Subtask ${subtaskId} not found on card ${cardId}`,
      );
    }
    await this.prisma.subtask.update({ where: { id: subtaskId }, data: dto });
    return this.findOne(cardId, ownerId);
  }

  async removeSubtask(cardId: string, subtaskId: string, ownerId: string) {
    const result = await this.prisma.subtask.deleteMany({
      where: { id: subtaskId, cardId, card: { ownerId } },
    });
    if (result.count === 0) {
      throw new NotFoundException(
        `Subtask ${subtaskId} not found on card ${cardId}`,
      );
    }
    return this.findOne(cardId, ownerId);
  }
}
