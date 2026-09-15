import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { NfrImpactLevel } from '../nfr-types';

const IMPACT_LEVELS: NfrImpactLevel[] = ['Low', 'Medium', 'High'];

export class CreateNfrDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(IMPACT_LEVELS)
  impactLevel: NfrImpactLevel;
}
