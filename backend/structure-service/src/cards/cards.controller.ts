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
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BulkCreateCardsDto } from './dto/bulk-create-cards.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.cardsService.findAll(status);
  }

  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto);
  }

  @Post('bulk')
  createMany(@Body() dto: BulkCreateCardsDto) {
    return this.cardsService.createMany(dto.cards);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsService.remove(id);
  }

  @Post(':id/subtasks')
  addSubtask(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateSubtaskDto) {
    return this.cardsService.addSubtask(id, dto);
  }

  @Patch(':id/subtasks/:subtaskId')
  updateSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subtaskId', ParseUUIDPipe) subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return this.cardsService.updateSubtask(id, subtaskId, dto);
  }

  @Delete(':id/subtasks/:subtaskId')
  removeSubtask(@Param('id', ParseUUIDPipe) id: string, @Param('subtaskId', ParseUUIDPipe) subtaskId: string) {
    return this.cardsService.removeSubtask(id, subtaskId);
  }
}
