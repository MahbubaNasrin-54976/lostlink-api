import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional } from 'class-validator';

export class CreateHandoverDto {
  @IsUUID()
  @IsNotEmpty()
  foundItemId: string;

  @IsString()
  @IsNotEmpty()
  passengerName: string;

  @IsEmail()
  @IsNotEmpty()
  passengerEmail: string;

  @IsString()
  @IsNotEmpty()
  passengerPhone: string;

  @IsOptional()
  @IsString()
  notes?: string;
}