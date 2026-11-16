import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { VehiclesService } from './vehicles.service.js';

import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';

@Controller('vehicles')
@Roles(UserRole.ADMIN)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(
      id,
      updateVehicleDto,
    );
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vehiclesService.deactivate(id);
  }
}