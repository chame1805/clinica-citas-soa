import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasModule } from './citas/citas.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5435),
        username: config.get<string>('DB_USER', 'citas_user'),
        password: config.get<string>('DB_PASSWORD', 'citas_pass'),
        database: config.get<string>('DB_NAME', 'citas_db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    RedisModule,
    AuthModule,
    CitasModule,
  ],
})
export class AppModule {}
