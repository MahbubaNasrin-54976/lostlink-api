import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Vehicle } from './entities/vehicle.entity.js';
import { TransportRoute } from '../routes/entities/transport-route.entity.js';

import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      TransportRoute,
    ]),
  ],

  controllers: [
    VehiclesController,
  ],

  providers: [
    VehiclesService,
  ],

  exports: [
    VehiclesService,
  ],
})
export class VehiclesModule {}