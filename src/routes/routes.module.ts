import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransportRoute } from './entities/transport-route.entity.js';
import { RoutesController } from './routes.controller.js';
import { RoutesService } from './routes.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransportRoute]),
  ],

  controllers: [
    RoutesController,
  ],

  providers: [
    RoutesService,
  ],

  exports: [
    RoutesService,
  ],
})
export class RoutesModule {}