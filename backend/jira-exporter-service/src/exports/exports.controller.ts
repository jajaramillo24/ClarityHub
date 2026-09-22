import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { CreateExportDto } from './dto/create-export.dto';
import { ProjectGuard } from '../auth/project.guard';
import { CurrentProject } from '../auth/current-project.decorator';

@UseGuards(ProjectGuard)
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  findAll(@CurrentProject() projectId: string) {
    return this.exportsService.findAll(projectId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.exportsService.findOne(id, projectId);
  }

  @Post()
  create(@Body() dto: CreateExportDto, @CurrentProject() projectId: string) {
    return this.exportsService.create(dto, projectId);
  }

  @Post(':id/retry')
  retry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.exportsService.retry(id, projectId);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
    @Res() res: Response,
  ) {
    const job = await this.exportsService.findOne(id, projectId);
    if (job.status !== 'completed' || !job.csvContent) {
      throw new BadRequestException(
        `Export job ${id} is not completed (status: ${job.status})`,
      );
    }
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="jira_import_${id}.csv"`,
    });
    res.send(job.csvContent);
  }
}
