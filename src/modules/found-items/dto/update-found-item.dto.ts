import { CreateFoundItemDto } from './create-found-item.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { FoundItemStatus } from '../../../common/enums/found-item-status.enum.js';

export class UpdateFoundItemDto {
  @IsOptional()
  @IsEnum(FoundItemStatus)
  status?: FoundItemStatus;
}

export interface UpdateFoundItemDto extends Partial<CreateFoundItemDto> {}