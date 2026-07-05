import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicosModule } from './medicos/medicos.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5434),
        username: config.get<string>('DB_USER', 'agenda_user'),
        password: config.get<string>('DB_PASSWORD', 'agenda_pass'),
        database: config.get<string>('DB_NAME', 'agenda_db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    MedicosModule,
    RedisModule,
  ],
})
export class AppModule {}
