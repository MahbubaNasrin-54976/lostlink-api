import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipClaim } from './entities/ownership-claim.entity.js';
import { ClaimVerification } from './entities/claim-verification.entity.js';
import { ItemMatch } from '../matches/entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { ClaimsController } from './claims.controller.js';
import { ClaimsService } from './claims.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OwnershipClaim,
      ClaimVerification,
      ItemMatch,
      LostItem,
    ]),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}