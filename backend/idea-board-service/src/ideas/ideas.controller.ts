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
import { ProjectGuard } from '../auth/project.guard';
import { CurrentProject } from '../auth/current-project.decorator';

@UseGuards(ProjectGuard)
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll(@CurrentProject() projectId: string) {
    return this.ideasService.findAll(projectId);
  }

  @Post()
  create(@Body() dto: CreateIdeaDto, @CurrentProject() projectId: string) {
    return this.ideasService.create(dto, projectId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIdeaDto,
    @CurrentProject() projectId: string,
  ) {
    return this.ideasService.update(id, dto, projectId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentProject() projectId: string,
  ) {
    return this.ideasService.remove(id, projectId);
  }
}
