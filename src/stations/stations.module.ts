import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Station } from './entities/station.entity.js';
import { StationsController } from './stations.controller.js';
import { StationsService } from './stations.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Station]),
  ],

  controllers: [
    StationsController,
  ],

  providers: [
    StationsService,
  ],

  exports: [
    StationsService,
  ],
})
export class StationsModule {}