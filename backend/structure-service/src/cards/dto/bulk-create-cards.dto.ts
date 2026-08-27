import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateCardDto } from './create-card.dto';

export class BulkCreateCardsDto {
  @ValidateNested({ each: true })
  @Type(() => CreateCardDto)
  cards: CreateCardDto[];
}
