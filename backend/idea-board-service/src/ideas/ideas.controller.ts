import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { OwnerGuard } from '../auth/owner.guard';
import { CurrentOwner } from '../auth/current-owner.decorator';

@UseGuards(OwnerGuard)
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll(@CurrentOwner() ownerId: string) {
    return this.ideasService.findAll(ownerId);
  }

  @Post()
  create(@Body() dto: CreateIdeaDto, @CurrentOwner() ownerId: string) {
    return this.ideasService.create(dto, ownerId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIdeaDto,
    @CurrentOwner() ownerId: string,
  ) {
    return this.ideasService.update(id, dto, ownerId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.ideasService.remove(id, ownerId);
  }
}
