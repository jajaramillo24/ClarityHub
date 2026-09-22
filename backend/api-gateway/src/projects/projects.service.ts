import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(dto: CreateProjectDto, ownerId: string) {
    return this.prisma.project.create({ data: { name: dto.name, ownerId } });
  }

  /** Also used by ProjectGuard to check that a project belongs to its caller. */
  async findOne(id: string, ownerId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }
}
