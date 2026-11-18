import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostItem } from './entities/lost-item.entity.js';
import { LostItemsController } from './lost-items.controller.js';
import { LostItemsService } from './lost-items.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([LostItem])],
  controllers: [LostItemsController],
  providers: [LostItemsService],
  exports: [LostItemsService],
})
export class LostItemsModule {}