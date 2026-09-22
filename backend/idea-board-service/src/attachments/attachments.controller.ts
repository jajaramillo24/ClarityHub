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
import { OwnerGuard } from '../auth/owner.guard';
import { CurrentOwner } from '../auth/current-owner.decorator';

@UseGuards(OwnerGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  findAll(@CurrentOwner() ownerId: string) {
    return this.attachmentsService.findAll(ownerId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.attachmentsService.findOne(id, ownerId);
  }

  @Post()
  create(@Body() dto: CreateAttachmentDto, @CurrentOwner() ownerId: string) {
    return this.attachmentsService.create(dto, ownerId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.attachmentsService.remove(id, ownerId);
  }
}
