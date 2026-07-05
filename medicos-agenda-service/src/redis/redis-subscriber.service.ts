import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MedicosService } from '../medicos/medicos.service';

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private static readonly CHANNEL = 'cita.confirmada';
  private readonly logger = new Logger(RedisSubscriberService.name);
  private readonly client: Redis;

  constructor(
    configService: ConfigService,
    private readonly medicosService: MedicosService,
  ) {
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    });
  }

  onModuleInit() {
    this.client.subscribe(RedisSubscriberService.CHANNEL, (err) => {
      if (err) {
        this.logger.error(`No se pudo suscribir a "${RedisSubscriberService.CHANNEL}": ${err.message}`);
        return;
      }
      this.logger.log(`Suscrito al canal "${RedisSubscriberService.CHANNEL}"`);
    });

    this.client.on('message', (channel, message) => {
      if (channel !== RedisSubscriberService.CHANNEL) return;
      void this.handleCitaConfirmada(message);
    });
  }

  private async handleCitaConfirmada(message: string): Promise<void> {
    try {
      const payload = JSON.parse(message) as { citaId: string; slotId: string };
      await this.medicosService.confirmar(payload.slotId);
      this.logger.log(`Slot ${payload.slotId} marcado como OCUPADO (cita ${payload.citaId} confirmada)`);
    } catch (error) {
      this.logger.error(`Error procesando evento cita.confirmada: ${(error as Error).message}`);
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
