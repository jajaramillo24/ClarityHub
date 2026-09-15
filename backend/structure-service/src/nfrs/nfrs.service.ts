import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNfrDto } from './dto/create-nfr.dto';

@Injectable()
export class NfrsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.nfr.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(dto: CreateNfrDto) {
    return this.prisma.nfr.create({
      data: {
        category: dto.category,
        title: dto.title,
        description: dto.description ?? '',
        impactLevel: dto.impactLevel,
      },
    });
  }

  createMany(dtos: CreateNfrDto[]) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.nfr.create({
          data: {
            category: dto.category,
            title: dto.title,
            description: dto.description ?? '',
            impactLevel: dto.impactLevel,
          },
        }),
      ),
    );
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.nfr.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`NFR ${id} not found`);
      }
      throw error;
    }
  }
}
