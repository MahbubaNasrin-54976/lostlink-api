
import { PartialType } from '@nestjs/mapped-types';
import { CreateFoundItemDto } from './create-found-item.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { FoundItemStatus } from '../../../common/enums/found-item-status.enum.js';

export class UpdateFoundItemDto extends PartialType(CreateFoundItemDto) {
  @IsOptional()
  @IsEnum(FoundItemStatus)
  status?: FoundItemStatus;
}
