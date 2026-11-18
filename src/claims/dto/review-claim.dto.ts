import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ClaimStatus } from '../../common/enums/claim-status.enum.js';

export class ReviewClaimDto {
  @IsEnum(ClaimStatus)
  claimStatus: ClaimStatus;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  reviewNote?: string;
}