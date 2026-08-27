import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Idea } from './idea.entity';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Injectable()
export class IdeasService {
  constructor(
    @InjectRepository(Idea)
    private readonly ideasRepository: Repository<Idea>,
  ) {}

  findAll(): Promise<Idea[]> {
    return this.ideasRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Idea> {
    const idea = await this.ideasRepository.findOne({ where: { id } });
    if (!idea) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
    return idea;
  }

  create(dto: CreateIdeaDto): Promise<Idea> {
    const idea = this.ideasRepository.create({
      content: dto.content,
      category: dto.category ?? null,
    });
    return this.ideasRepository.save(idea);
  }

  async update(id: string, dto: UpdateIdeaDto): Promise<Idea> {
    const idea = await this.findOne(id);
    Object.assign(idea, dto);
    return this.ideasRepository.save(idea);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ideasRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Idea ${id} not found`);
    }
  }
}
