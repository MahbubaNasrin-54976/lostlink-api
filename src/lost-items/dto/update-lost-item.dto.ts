import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateLostItemDto } from './create-lost-item.dto.js';
import { LostItemStatus } from '../../common/enums/lost-item-status.enum.js';

export class UpdateLostItemDto extends PartialType(CreateLostItemDto) {
  @IsOptional()
  @IsEnum(LostItemStatus)
  status?: LostItemStatus;
}