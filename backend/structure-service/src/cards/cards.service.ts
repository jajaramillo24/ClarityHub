import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectCard } from './project-card.entity';
import { Subtask } from './subtask.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(ProjectCard)
    private readonly cardsRepository: Repository<ProjectCard>,
    @InjectRepository(Subtask)
    private readonly subtasksRepository: Repository<Subtask>,
  ) {}

  findAll(status?: string): Promise<ProjectCard[]> {
    return this.cardsRepository.find({
      where: status ? { status: status as ProjectCard['status'] } : {},
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProjectCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }
    return card;
  }

  async create(dto: CreateCardDto): Promise<ProjectCard> {
    const card = this.cardsRepository.create({
      title: dto.title,
      description: dto.description ?? '',
      status: 'Draft',
    });
    const saved = await this.cardsRepository.save(card);
    // save() doesn't populate eager relations on a fresh entity — a new
    // card never has subtasks yet, but leaving the field undefined instead
    // of [] breaks any caller (the frontend included) that reads
    // card.subtasks.length without checking for undefined first.
    return { ...saved, subtasks: [] };
  }

  async createMany(dtos: CreateCardDto[]): Promise<ProjectCard[]> {
    const cards = dtos.map((dto) =>
      this.cardsRepository.create({
        title: dto.title,
        description: dto.description ?? '',
        status: 'Draft' as const,
      }),
    );
    const saved = await this.cardsRepository.save(cards);
    return saved.map((card) => ({ ...card, subtasks: [] }));
  }

  async update(id: string, dto: UpdateCardDto): Promise<ProjectCard> {
    const card = await this.findOne(id);
    Object.assign(card, dto);
    return this.cardsRepository.save(card);
  }

  async remove(id: string): Promise<void> {
    const result = await this.cardsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Card ${id} not found`);
    }
  }

  async addSubtask(cardId: string, dto: CreateSubtaskDto): Promise<ProjectCard> {
    await this.findOne(cardId);
    const subtask = this.subtasksRepository.create({ ...dto, cardId, completed: false });
    await this.subtasksRepository.save(subtask);
    return this.findOne(cardId);
  }

  async updateSubtask(
    cardId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
  ): Promise<ProjectCard> {
    const subtask = await this.subtasksRepository.findOne({
      where: { id: subtaskId, cardId },
    });
    if (!subtask) {
      throw new NotFoundException(`Subtask ${subtaskId} not found on card ${cardId}`);
    }
    Object.assign(subtask, dto);
    await this.subtasksRepository.save(subtask);
    return this.findOne(cardId);
  }

  async removeSubtask(cardId: string, subtaskId: string): Promise<ProjectCard> {
    const result = await this.subtasksRepository.delete({ id: subtaskId, cardId });
    if (result.affected === 0) {
      throw new NotFoundException(`Subtask ${subtaskId} not found on card ${cardId}`);
    }
    return this.findOne(cardId);
  }
}
