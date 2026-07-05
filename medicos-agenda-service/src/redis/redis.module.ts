import { Module } from '@nestjs/common';
import { RedisSubscriberService } from './redis-subscriber.service';
import { MedicosModule } from '../medicos/medicos.module';

@Module({
  imports: [MedicosModule],
  providers: [RedisSubscriberService],
})
export class RedisModule {}
