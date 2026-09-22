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
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { ProjectGuard } from '../auth/project.guard';
import { CurrentProject } from '../auth/current-project.decorator';

@UseGuards(ProjectGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  findAll(@CurrentProject() projectId: string) {
    return this.attachmentsService.findAll(projectId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.attachmentsService.findOne(id, projectId);
  }

  @Post()
  create(
    @Body() dto: CreateAttachmentDto,
    @CurrentProject() projectId: string,
  ) {
    return this.attachmentsService.create(dto, projectId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.attachmentsService.remove(id, projectId);
  }
}
