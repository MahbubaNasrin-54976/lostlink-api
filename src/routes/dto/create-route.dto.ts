import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9_-]+$/)
  routeCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  routeName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  startPoint: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  endPoint: string;
}