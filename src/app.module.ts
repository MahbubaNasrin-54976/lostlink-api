import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import configuration from './config/configuration.js';
import { validationSchema } from './config/validation.schema.js';

import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RoutesModule } from './routes/routes.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';
import { StationsModule } from './stations/stations.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { FraudFlagsModule } from './fraud-flags/fraud-flags.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { MailModule } from './mail/mail.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: '.env',
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    RoutesModule,
    VehiclesModule,
    StationsModule,
    CategoriesModule,
    FraudFlagsModule,
    AuditLogsModule,
    MailModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}