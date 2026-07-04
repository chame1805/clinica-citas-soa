import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita, CitaEstado } from './entities/cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita) private readonly citasRepository: Repository<Cita>,
  ) {}

  create(dto: CreateCitaDto): Promise<Cita> {
    const cita = this.citasRepository.create({
      pacienteId: dto.pacienteId,
      medicoId: dto.medicoId,
      slotId: dto.slotId,
      motivoConsulta: dto.motivoConsulta,
      estado: CitaEstado.CONFIRMADA,
    });
    return this.citasRepository.save(cita);
  }

  async findOne(id: string): Promise<Cita> {
    const cita = await this.citasRepository.findOne({ where: { id } });
    if (!cita) throw new NotFoundException(`Cita ${id} no encontrada`);
    return cita;
  }

  findByPaciente(pacienteId: string): Promise<Cita[]> {
    return this.citasRepository.find({ where: { pacienteId } });
  }
}
