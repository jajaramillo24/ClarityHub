import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll() {
    return this.ideasService.findAll();
  }

  @Post()
  create(@Body() dto: CreateIdeaDto) {
    return this.ideasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIdeaDto) {
    return this.ideasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ideasService.remove(id);
  }
}
