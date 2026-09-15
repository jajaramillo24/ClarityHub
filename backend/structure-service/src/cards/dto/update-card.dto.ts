import { IsArray, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { CardStatus } from '../card-types';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptanceCriteria?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  totalStoryPoints?: number;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risks?: string[];

  @IsOptional()
  @IsIn(['Draft', 'Ready', 'Exported'])
  status?: CardStatus;
}
