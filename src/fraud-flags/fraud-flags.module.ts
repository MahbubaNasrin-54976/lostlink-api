import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { FraudFlag } from './entities/fraud-flag.entity.js';
import { FraudFlagsController } from './fraud-flags.controller.js';
import { FraudFlagsService } from './fraud-flags.service.js';

@Module({
  imports: [
  TypeOrmModule.forFeature([FraudFlag]),
  AuditLogsModule,
],

  controllers: [
    FraudFlagsController,
  ],

  providers: [
    FraudFlagsService,
  ],

  exports: [
    FraudFlagsService,
  ],
})
export class FraudFlagsModule {}