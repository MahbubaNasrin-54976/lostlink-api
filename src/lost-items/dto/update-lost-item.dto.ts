
import { PartialType } from '@nestjs/mapped-types';
import { CreateLostItemDto } from './create-lost-item.dto.js';

export class UpdateLostItemDto extends PartialType(CreateLostItemDto) {}
