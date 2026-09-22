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
import { OwnerGuard } from '../auth/owner.guard';
import { CurrentOwner } from '../auth/current-owner.decorator';

@UseGuards(OwnerGuard)
@Controller('nfrs')
export class NfrsController {
  constructor(private readonly nfrsService: NfrsService) {}

  @Get()
  findAll(@CurrentOwner() ownerId: string) {
    return this.nfrsService.findAll(ownerId);
  }

  @Post()
  create(@Body() dto: CreateNfrDto, @CurrentOwner() ownerId: string) {
    return this.nfrsService.create(dto, ownerId);
  }

  @Post('bulk')
  createMany(@Body() dto: BulkCreateNfrsDto, @CurrentOwner() ownerId: string) {
    return this.nfrsService.createMany(dto.nfrs, ownerId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerId: string,
  ) {
    return this.nfrsService.remove(id, ownerId);
  }
}
