import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class IdeaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  base64: string;
}

export class NfrDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsIn(['Low', 'Medium', 'High'])
  impactLevel: 'Low' | 'Medium' | 'High';
}

export class GenerationOptionsDto {
  @IsBoolean()
  includeBackend: boolean;

  @IsBoolean()
  includeFrontend: boolean;

  @IsBoolean()
  includeTesting: boolean;

  @IsBoolean()
  includeDocs: boolean;

  @IsBoolean()
  detailedEstimation: boolean;
}

export class SummarizeIdeasDto {
  @ValidateNested({ each: true })
  @Type(() => IdeaDto)
  ideas: IdeaDto[];

  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];
}

export class AnalyzeRisksDto {
  @ValidateNested({ each: true })
  @Type(() => NfrDto)
  nfrs: NfrDto[];
}

export class GenerateNfrsDto {
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ValidateNested({ each: true })
  @Type(() => IdeaDto)
  ideas: IdeaDto[];
}

export class GenerateCardsDto {
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ValidateNested({ each: true })
  @Type(() => IdeaDto)
  ideas: IdeaDto[];

  @ValidateNested({ each: true })
  @Type(() => NfrDto)
  nfrs: NfrDto[];
}

export class GenerateSmartCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @ValidateNested({ each: true })
  @Type(() => IdeaDto)
  ideas: IdeaDto[];

  @ValidateNested({ each: true })
  @Type(() => NfrDto)
  nfrs: NfrDto[];

  @ValidateNested()
  @Type(() => GenerationOptionsDto)
  options: GenerationOptionsDto;
}
