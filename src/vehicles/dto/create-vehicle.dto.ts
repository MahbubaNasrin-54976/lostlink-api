import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  @Matches(/^[A-Za-z0-9-]+$/)
  vehicleNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  vehicleType: string;

  @IsUUID()
  routeId: string;
}