
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  fullName: string;

  @IsEmail()
  @Length(5, 150)
  email: string;

  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}
