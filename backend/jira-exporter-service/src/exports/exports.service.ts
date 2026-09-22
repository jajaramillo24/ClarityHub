import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, ExportJob } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportDto } from './dto/create-export.dto';
import { StructureClientService } from '../structure-client/structure-client.service';
import { CsvColumn } from '../types';
import { DEFAULT_COLUMNS, generateJiraCsv } from '../csv/csv-generator';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly structureClient: StructureClientService,
  ) {}

  findAll(ownerId: string) {
    return this.prisma.exportJob.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string): Promise<ExportJob> {
    const job = await this.prisma.exportJob.findFirst({
      where: { id, ownerId },
    });
    if (!job) {
      throw new NotFoundException(`Export job ${id} not found`);
    }
    return job;
  }

  async create(dto: CreateExportDto, ownerId: string): Promise<ExportJob> {
    const job = await this.prisma.exportJob.create({
      data: {
        ownerId,
        status: 'pending',
        delimiter: dto.delimiter ?? ';',
        includeSubtasks: dto.includeSubtasks ?? true,
        columns: (dto.columns ??
          DEFAULT_COLUMNS) as unknown as Prisma.InputJsonValue,
      },
    });
    return this.run(job);
  }

  async retry(id: string, ownerId: string): Promise<ExportJob> {
    const job = await this.findOne(id, ownerId);
    return this.run(job);
  }

  /**
   * Executes (or re-executes) an export job. The structured backlog itself
   * lives in structure-service's own database — a failure here only ever
   * marks this job 'failed' with the reason attached, so nothing about the
   * backlog is at risk, and the same job can be retried once whatever
   * failed (usually: structure-service being unreachable) is fixed.
   */
  private async run(job: ExportJob): Promise<ExportJob> {
    let update: Prisma.ExportJobUpdateInput;
    try {
      const cards = await this.structureClient.fetchReadyCards(job.ownerId);
      const csvContent = generateJiraCsv(cards, {
        delimiter: job.delimiter as ',' | ';',
        includeSubtasks: job.includeSubtasks,
        columns: job.columns as unknown as CsvColumn[],
      });

      update = {
        status: 'completed',
        cardCount: cards.length,
        csvContent,
        errorMessage: null,
      };
    } catch (error) {
      this.logger.error(`Export job ${job.id} failed`, error as Error);
      update = { status: 'failed', errorMessage: (error as Error).message };
    }

    return this.prisma.exportJob.update({
      where: { id: job.id },
      data: update,
    });
  }
}
