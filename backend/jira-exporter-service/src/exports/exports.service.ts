import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportJob } from './export-job.entity';
import { CreateExportDto } from './dto/create-export.dto';
import { StructureClientService } from '../structure-client/structure-client.service';
import { DEFAULT_COLUMNS, generateJiraCsv } from '../csv/csv-generator';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    @InjectRepository(ExportJob)
    private readonly exportsRepository: Repository<ExportJob>,
    private readonly structureClient: StructureClientService,
  ) {}

  findAll(): Promise<ExportJob[]> {
    return this.exportsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ExportJob> {
    const job = await this.exportsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Export job ${id} not found`);
    }
    return job;
  }

  async create(dto: CreateExportDto): Promise<ExportJob> {
    const job = this.exportsRepository.create({
      status: 'pending',
      delimiter: dto.delimiter ?? ';',
      includeSubtasks: dto.includeSubtasks ?? true,
      columns: dto.columns ?? DEFAULT_COLUMNS,
    });
    await this.exportsRepository.save(job);
    return this.run(job);
  }

  async retry(id: string): Promise<ExportJob> {
    const job = await this.findOne(id);
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
    try {
      const cards = await this.structureClient.fetchReadyCards();
      const csvContent = generateJiraCsv(cards, {
        delimiter: job.delimiter,
        includeSubtasks: job.includeSubtasks,
        columns: job.columns,
      });

      job.status = 'completed';
      job.cardCount = cards.length;
      job.csvContent = csvContent;
      job.errorMessage = null;
    } catch (error) {
      this.logger.error(`Export job ${job.id} failed`, error as Error);
      job.status = 'failed';
      job.errorMessage = (error as Error).message;
    }

    return this.exportsRepository.save(job);
  }
}
