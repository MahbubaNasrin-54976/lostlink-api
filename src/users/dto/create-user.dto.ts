
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

import { UserRole } from '../../common/enums/user-role.enum.js';

export class CreateUserDto {
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

  @IsEnum(UserRole)
  role: UserRole;
}
