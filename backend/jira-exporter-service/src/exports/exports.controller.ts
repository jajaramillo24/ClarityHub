import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { CreateExportDto } from './dto/create-export.dto';

@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  findAll() {
    return this.exportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExportDto) {
    return this.exportsService.create(dto);
  }

  @Post(':id/retry')
  retry(@Param('id') id: string) {
    return this.exportsService.retry(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const job = await this.exportsService.findOne(id);
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
