import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisPublisherService.name);
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async publish(channel: string, payload: Record<string, unknown>): Promise<void> {
    const message = JSON.stringify(payload);
    await this.client.publish(channel, message);
    this.logger.log(`Publicado en "${channel}": ${message}`);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
