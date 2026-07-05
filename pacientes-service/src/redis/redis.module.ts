import { Module } from '@nestjs/common';
import { RedisSubscriberService } from './redis-subscriber.service';
import { PacientesModule } from '../pacientes/pacientes.module';

@Module({
  imports: [PacientesModule],
  providers: [RedisSubscriberService],
})
export class RedisModule {}
