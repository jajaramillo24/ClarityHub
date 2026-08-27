import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
