import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTransferDto {
  @IsUUID()
  @IsNotEmpty()
  foundItemId: string;

  @IsString()
  @IsNotEmpty()
  fromStation: string;

  @IsString()
  @IsNotEmpty()
  toStation: string;

  @IsOptional()
  @IsString()
  notes?: string;
}