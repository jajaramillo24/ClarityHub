import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { CsvField } from '../../types';

export class CsvColumnDto {
  @IsString()
  id: string;

  @IsString()
  header: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  field: CsvField;
}

export class CreateExportDto {
  @IsOptional()
  @IsIn([',', ';'])
  delimiter?: ',' | ';';

  @IsOptional()
  @IsBoolean()
  includeSubtasks?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvColumnDto)
  columns?: CsvColumnDto[];
}
