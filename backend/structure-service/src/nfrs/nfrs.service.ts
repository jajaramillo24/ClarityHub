import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNfrDto } from './dto/create-nfr.dto';

@Injectable()
export class NfrsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.nfr.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(dto: CreateNfrDto, ownerId: string) {
    return this.prisma.nfr.create({
      data: {
        ownerId,
        category: dto.category,
        title: dto.title,
        description: dto.description ?? '',
        impactLevel: dto.impactLevel,
      },
    });
  }

  createMany(dtos: CreateNfrDto[], ownerId: string) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.nfr.create({
          data: {
            ownerId,
            category: dto.category,
            title: dto.title,
            description: dto.description ?? '',
            impactLevel: dto.impactLevel,
          },
        }),
      ),
    );
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.prisma.nfr.deleteMany({ where: { id, ownerId } });
    if (result.count === 0) {
      throw new NotFoundException(`NFR ${id} not found`);
    }
  }
}
