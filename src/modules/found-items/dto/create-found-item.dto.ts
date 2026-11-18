import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEvidenceDto } from './create-evidence.dto.js';

export class CreateFoundItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  foundLocation: string;

  @IsDateString()
  foundAt: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvidenceDto)
  evidence?: CreateEvidenceDto[];
}