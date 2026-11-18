import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9_-]+$/)
  stationCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  stationName: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  locationDescription?: string;
}