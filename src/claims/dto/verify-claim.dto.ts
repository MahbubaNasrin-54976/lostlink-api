
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class PrivateAttributeAnswerDto {
  @IsUUID()
  privateAttributeId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  answer: string;
}

export class VerifyClaimDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => PrivateAttributeAnswerDto)
  answers: PrivateAttributeAnswerDto[];
}
