import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class VerifyClaimDto {
  @IsUUID()
  privateAttributeId: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  attemptNumber?: number;
}