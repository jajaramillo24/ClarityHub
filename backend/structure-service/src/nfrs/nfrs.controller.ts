import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { NfrsService } from './nfrs.service';
import { CreateNfrDto } from './dto/create-nfr.dto';
import { BulkCreateNfrsDto } from './dto/bulk-create-nfrs.dto';

@Controller('nfrs')
export class NfrsController {
  constructor(private readonly nfrsService: NfrsService) {}

  @Get()
  findAll() {
    return this.nfrsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateNfrDto) {
    return this.nfrsService.create(dto);
  }

  @Post('bulk')
  createMany(@Body() dto: BulkCreateNfrsDto) {
    return this.nfrsService.createMany(dto.nfrs);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.nfrsService.remove(id);
  }
}
