import { PartialType } from '@nestjs/mapped-types';

import { CreateStationDto } from './create-station.dto.js';

export class UpdateStationDto extends PartialType(CreateStationDto) {}