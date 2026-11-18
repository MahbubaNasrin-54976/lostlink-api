
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateLostItemDto {
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  routeId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  itemTitle: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  itemColor?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  brand?: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 2000)
  description: string;

  @IsDateString()
  lostAt: string;
}
