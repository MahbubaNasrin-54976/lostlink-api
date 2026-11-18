import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { LostItemsModule } from './lost-items/lost-items.module.js';
import { MatchesModule } from './matches/matches.module.js';
import { ClaimsModule } from './claims/claims.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', '1234'),
        database: configService.get<string>(
          'DB_DATABASE',
          'lostlink_passenger_db',
        ),
        autoLoadEntities: true,
        synchronize: true, // Automatically creates your 4 tables in PostgreSQL!
        logging: true,
      }),
    }),
    LostItemsModule,
    MatchesModule,
    ClaimsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}