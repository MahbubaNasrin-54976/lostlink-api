import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreatePrivateAttributeDto {
  @IsInt()
  @Min(1)
  @Max(2)
  questionNumber: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(250)
  question: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  answer: string;
}