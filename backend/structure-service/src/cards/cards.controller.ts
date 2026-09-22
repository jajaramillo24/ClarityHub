import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BulkCreateCardsDto } from './dto/bulk-create-cards.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { ProjectGuard } from '../auth/project.guard';
import { CurrentProject } from '../auth/current-project.decorator';

@UseGuards(ProjectGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(
    @CurrentProject() projectId: string,
    @Query('status') status?: string,
  ) {
    return this.cardsService.findAll(projectId, status);
  }

  @Post()
  create(@Body() dto: CreateCardDto, @CurrentProject() projectId: string) {
    return this.cardsService.create(dto, projectId);
  }

  @Post('bulk')
  createMany(
    @Body() dto: BulkCreateCardsDto,
    @CurrentProject() projectId: string,
  ) {
    return this.cardsService.createMany(dto.cards, projectId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
    @CurrentProject() projectId: string,
  ) {
    return this.cardsService.update(id, dto, projectId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.cardsService.remove(id, projectId);
  }

  @Post(':id/subtasks')
  addSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSubtaskDto,
    @CurrentProject() projectId: string,
  ) {
    return this.cardsService.addSubtask(id, dto, projectId);
  }

  @Patch(':id/subtasks/:subtaskId')
  updateSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subtaskId', ParseUUIDPipe) subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
    @CurrentProject() projectId: string,
  ) {
    return this.cardsService.updateSubtask(id, subtaskId, dto, projectId);
  }

  @Delete(':id/subtasks/:subtaskId')
  removeSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subtaskId', ParseUUIDPipe) subtaskId: string,
    @CurrentProject() projectId: string,
  ) {
    return this.cardsService.removeSubtask(id, subtaskId, projectId);
  }
}
