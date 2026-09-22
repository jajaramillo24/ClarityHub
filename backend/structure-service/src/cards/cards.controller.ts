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
import { OwnerGuard } from '../auth/owner.guard';
import { CurrentOwner } from '../auth/current-owner.decorator';

@UseGuards(OwnerGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(@CurrentOwner() ownerId: string, @Query('status') status?: string) {
    return this.cardsService.findAll(ownerId, status);
  }

  @Post()
  create(@Body() dto: CreateCardDto, @CurrentOwner() ownerId: string) {
    return this.cardsService.create(dto, ownerId);
  }

  @Post('bulk')
  createMany(@Body() dto: BulkCreateCardsDto, @CurrentOwner() ownerId: string) {
    return this.cardsService.createMany(dto.cards, ownerId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
    @CurrentOwner() ownerId: string,
  ) {
    return this.cardsService.update(id, dto, ownerId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.cardsService.remove(id, ownerId);
  }

  @Post(':id/subtasks')
  addSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSubtaskDto,
    @CurrentOwner() ownerId: string,
  ) {
    return this.cardsService.addSubtask(id, dto, ownerId);
  }

  @Patch(':id/subtasks/:subtaskId')
  updateSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subtaskId', ParseUUIDPipe) subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
    @CurrentOwner() ownerId: string,
  ) {
    return this.cardsService.updateSubtask(id, subtaskId, dto, ownerId);
  }

  @Delete(':id/subtasks/:subtaskId')
  removeSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subtaskId', ParseUUIDPipe) subtaskId: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.cardsService.removeSubtask(id, subtaskId, ownerId);
  }
}
