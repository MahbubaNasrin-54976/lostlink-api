import { IsEnum, IsString, IsUrl, IsOptional } from 'class-validator';
import { EvidenceType } from '../../../common/enums/evidence-type.enum.js';

export class CreateEvidenceDto {
  @IsEnum(EvidenceType)
  type: EvidenceType;

  @IsUrl()
  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  notes?: string;
}