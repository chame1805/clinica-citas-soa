import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Cita, CitaEstado } from './entities/cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { RedisPublisherService } from '../redis/redis-publisher.service';

interface PacienteEstadoResponse {
  existe: boolean;
  activo: boolean;
}

@Injectable()
export class CitasService {
  private readonly logger = new Logger(CitasService.name);
  private readonly pacientesUrl: string;
  private readonly agendaUrl: string;

  constructor(
    @InjectRepository(Cita) private readonly citasRepository: Repository<Cita>,
    private readonly httpService: HttpService,
    configService: ConfigService,
    private readonly redisPublisher: RedisPublisherService,
  ) {
    this.pacientesUrl = configService.get<string>('PACIENTES_SERVICE_URL', 'http://localhost:3001');
    this.agendaUrl = configService.get<string>('AGENDA_SERVICE_URL', 'http://localhost:3002');
  }

  async create(dto: CreateCitaDto): Promise<Cita> {
    let cita = this.citasRepository.create({
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      slotId: dto.slotId,
      motivoConsulta: dto.motivoConsulta,
      estado: CitaEstado.PENDIENTE,
    });
    cita = await this.citasRepository.save(cita);

    await this.validarPaciente(cita);
    await this.reservarSlot(cita);

    try {
      await this.validarReglasDeNegocio(cita);
    } catch (error) {
      await this.compensarReserva(cita, (error as Error).message);
      throw error;
    }

    cita.estado = CitaEstado.CONFIRMADA;
    await this.citasRepository.save(cita);

    await this.redisPublisher.publish('cita.confirmada', {
      citaId: cita.id,
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      slotId: cita.slotId,
    });

    return cita;
  }

  async findOne(id: string): Promise<Cita> {
    const cita = await this.citasRepository.findOne({ where: { id } });
    if (!cita) throw new NotFoundException(`Cita ${id} no encontrada`);
    return cita;
  }

  findByPaciente(pacienteId: string): Promise<Cita[]> {
    return this.citasRepository.find({ where: { pacienteId } });
  }

  private async validarPaciente(cita: Cita): Promise<void> {
    let estado: PacienteEstadoResponse;
    try {
      const response = await firstValueFrom(
        this.httpService.get<PacienteEstadoResponse>(
          `${this.pacientesUrl}/pacientes/${cita.pacienteId}/estado`,
        ),
      );
      estado = response.data;
    } catch (error) {
      this.logger.error(`Error validando paciente: ${(error as AxiosError).message}`);
      await this.marcarFallida(cita, 'No se pudo validar el paciente (pacientes-service no disponible)');
      throw new ServiceUnavailableException('pacientes-service no disponible');
    }

    if (!estado.existe || !estado.activo) {
      await this.marcarFallida(cita, 'El paciente no existe o no está activo');
      throw new BadRequestException('El paciente no existe o no está activo');
    }
  }

  private async reservarSlot(cita: Cita): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.agendaUrl}/slots/${cita.slotId}/reservar`, {
          citaId: cita.id,
          pacienteId: cita.pacienteId,
        }),
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      if (status === 409) {
        await this.marcarFallida(cita, 'El horario ya no está disponible');
        throw new ConflictException('El horario ya no está disponible');
      }
      if (status === 404) {
        await this.marcarFallida(cita, 'El horario solicitado no existe');
        throw new NotFoundException('El horario solicitado no existe');
      }
      await this.marcarFallida(cita, 'No se pudo reservar el horario (medicos-agenda-service no disponible)');
      throw new ServiceUnavailableException('medicos-agenda-service no disponible');
    }
  }

  private async validarReglasDeNegocio(cita: Cita): Promise<void> {
    const citaConflicto = await this.citasRepository.findOne({
      where: {
        pacienteId: cita.pacienteId,
        medicoId: cita.medicoId,
        estado: CitaEstado.CONFIRMADA,
      },
    });
    if (citaConflicto) {
      throw new ConflictException(
        `El paciente ya tiene una cita confirmada con este médico (cita ${citaConflicto.id})`,
      );
    }
  }

  private async compensarReserva(cita: Cita, motivo: string): Promise<void> {
    this.logger.warn(`Compensando cita ${cita.id}: ${motivo}`);
    try {
      await firstValueFrom(
        this.httpService.post(`${this.agendaUrl}/slots/${cita.slotId}/liberar`, {
          citaId: cita.id,
          motivo,
        }),
      );
    } catch (error) {
      this.logger.error(`Falló la compensación del slot ${cita.slotId}: ${(error as AxiosError).message}`);
    }
    await this.marcarFallida(cita, motivo);
  }

  private async marcarFallida(cita: Cita, motivo: string): Promise<void> {
    cita.estado = CitaEstado.FALLIDA;
    cita.motivoFallo = motivo;
    await this.citasRepository.save(cita);
  }
}
