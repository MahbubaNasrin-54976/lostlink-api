import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersService } from './transfers.service.js';
import { TransfersController } from './transfers.controller.js';
import { ItemTransferEntity } from './entities/item-transfer.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ItemTransferEntity])],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}