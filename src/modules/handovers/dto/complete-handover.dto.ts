import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompleteHandoverDto {
  @IsString()
  @IsNotEmpty()
  verificationCode: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;
}