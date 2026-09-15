import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import type { SubtaskType } from '../card-types';

const SUBTASK_TYPES: SubtaskType[] = ['Backend', 'Frontend', 'Testing', 'DevOps', 'Docs'];

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsIn(SUBTASK_TYPES)
  type: SubtaskType;

  @IsInt()
  @Min(0)
  storyPoints: number;
}
