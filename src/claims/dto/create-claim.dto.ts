import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  matchId: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  claimNote?: string;
}