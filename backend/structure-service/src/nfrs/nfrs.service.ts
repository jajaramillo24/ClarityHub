import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNfrDto } from './dto/create-nfr.dto';

@Injectable()
export class NfrsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string) {
    return this.prisma.nfr.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(dto: CreateNfrDto, projectId: string) {
    return this.prisma.nfr.create({
      data: {
        projectId,
        category: dto.category,
        title: dto.title,
        description: dto.description ?? '',
        impactLevel: dto.impactLevel,
      },
    });
  }

  createMany(dtos: CreateNfrDto[], projectId: string) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.nfr.create({
          data: {
            projectId,
            category: dto.category,
            title: dto.title,
            description: dto.description ?? '',
            impactLevel: dto.impactLevel,
          },
        }),
      ),
    );
  }

  async remove(id: string, projectId: string): Promise<void> {
    const result = await this.prisma.nfr.deleteMany({
      where: { id, projectId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`NFR ${id} not found`);
    }
  }
}
