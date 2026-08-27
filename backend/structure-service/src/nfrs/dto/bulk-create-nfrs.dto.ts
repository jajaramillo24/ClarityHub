import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateNfrDto } from './create-nfr.dto';

export class BulkCreateNfrsDto {
  @ValidateNested({ each: true })
  @Type(() => CreateNfrDto)
  nfrs: CreateNfrDto[];
}
