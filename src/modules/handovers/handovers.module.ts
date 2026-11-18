import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandoversService } from './handovers.service.js';
import { HandoversController } from './handovers.controller.js';
import { ItemHandoverEntity } from './entities/item-handover.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ItemHandoverEntity])],
  controllers: [HandoversController],
  providers: [HandoversService],
  exports: [HandoversService],
})
export class HandoversModule {}