import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ClaimStatus } from '../../common/enums/claim-status.enum.js';

export class ReviewClaimDto {
  @IsEnum(ClaimStatus)
  claimStatus: ClaimStatus;

  @IsOptional()
  @IsUUID()
  reviewedByAdminId?: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  reviewNote?: string;
}