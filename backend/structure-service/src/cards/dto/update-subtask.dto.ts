import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { SubtaskType } from '../card-types';

const SUBTASK_TYPES: SubtaskType[] = ['Backend', 'Frontend', 'Testing', 'DevOps', 'Docs'];

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(SUBTASK_TYPES)
  type?: SubtaskType;

  @IsOptional()
  @IsInt()
  @Min(0)
  storyPoints?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
