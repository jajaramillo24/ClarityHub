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
import { OwnerGuard } from '../auth/owner.guard';
import { CurrentOwner } from '../auth/current-owner.decorator';

@UseGuards(OwnerGuard)
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  findAll(@CurrentOwner() ownerId: string) {
    return this.exportsService.findAll(ownerId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.exportsService.findOne(id, ownerId);
  }

  @Post()
  create(@Body() dto: CreateExportDto, @CurrentOwner() ownerId: string) {
    return this.exportsService.create(dto, ownerId);
  }

  @Post(':id/retry')
  retry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.exportsService.retry(id, ownerId);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
    @Res() res: Response,
  ) {
    const job = await this.exportsService.findOne(id, ownerId);
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
