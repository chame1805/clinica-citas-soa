import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesModule } from './pacientes/pacientes.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5433),
        username: config.get<string>('DB_USER', 'pacientes_user'),
        password: config.get<string>('DB_PASSWORD', 'pacientes_pass'),
        database: config.get<string>('DB_NAME', 'pacientes_db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    PacientesModule,
    RedisModule,
  ],
})
export class AppModule {}
