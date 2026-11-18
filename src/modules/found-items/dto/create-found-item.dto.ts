import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { CreatePrivateAttributeDto } from './create-private-attribute.dto.js';
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

    @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreatePrivateAttributeDto)
  privateAttributes: CreatePrivateAttributeDto[];
}