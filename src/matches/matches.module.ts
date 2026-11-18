import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemMatch } from './entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { MatchesController } from './matches.controller.js';
import { MatchesService } from './matches.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ItemMatch, LostItem])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}