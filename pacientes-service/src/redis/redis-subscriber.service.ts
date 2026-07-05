import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PacientesService } from '../pacientes/pacientes.service';

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private static readonly CHANNEL = 'cita.confirmada';
  private readonly logger = new Logger(RedisSubscriberService.name);
  private readonly client: Redis;

  constructor(
    configService: ConfigService,
    private readonly pacientesService: PacientesService,
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
      const payload = JSON.parse(message) as { citaId: string; pacienteId: string };
      const paciente = await this.pacientesService.findOne(payload.pacienteId);
      this.logger.log(`Notificación enviada a ${paciente.email} — su cita ${payload.citaId} fue confirmada`);
    } catch (error) {
      this.logger.error(`Error procesando evento cita.confirmada: ${(error as Error).message}`);
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
