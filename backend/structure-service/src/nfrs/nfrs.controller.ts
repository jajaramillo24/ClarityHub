import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NfrsService } from './nfrs.service';
import { CreateNfrDto } from './dto/create-nfr.dto';
import { BulkCreateNfrsDto } from './dto/bulk-create-nfrs.dto';
import { ProjectGuard } from '../auth/project.guard';
import { CurrentProject } from '../auth/current-project.decorator';

@UseGuards(ProjectGuard)
@Controller('nfrs')
export class NfrsController {
  constructor(private readonly nfrsService: NfrsService) {}

  @Get()
  findAll(@CurrentProject() projectId: string) {
    return this.nfrsService.findAll(projectId);
  }

  @Post()
  create(@Body() dto: CreateNfrDto, @CurrentProject() projectId: string) {
    return this.nfrsService.create(dto, projectId);
  }

  @Post('bulk')
  createMany(
    @Body() dto: BulkCreateNfrsDto,
    @CurrentProject() projectId: string,
  ) {
    return this.nfrsService.createMany(dto.nfrs, projectId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.nfrsService.remove(id, projectId);
  }
}
