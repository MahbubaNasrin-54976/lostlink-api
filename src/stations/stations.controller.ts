import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { StationsService } from './stations.service.js';

import { CreateStationDto } from './dto/create-station.dto.js';
import { UpdateStationDto } from './dto/update-station.dto.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';

@Controller('stations')
@Roles(UserRole.ADMIN)
export class StationsController {
  constructor(
    private readonly stationsService: StationsService,
  ) {}

  @Post()
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  findAll() {
    return this.stationsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStationDto: UpdateStationDto,
  ) {
    return this.stationsService.update(
      id,
      updateStationDto,
    );
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stationsService.deactivate(id);
  }
}