import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { PacienteEstadoResponseDto } from './dto/paciente-estado-response.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacientesRepository: Repository<Paciente>,
  ) {}

  async create(dto: CreatePacienteDto): Promise<Paciente> {
    const existente = await this.pacientesRepository.findOne({
      where: { documentoIdentidad: dto.documentoIdentidad },
    });
    if (existente) {
      throw new ConflictException('Ya existe un paciente con ese documento de identidad');
    }
    const paciente = this.pacientesRepository.create(dto);
    return this.pacientesRepository.save(paciente);
  }

  findAll(): Promise<Paciente[]> {
    return this.pacientesRepository.find();
  }

  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne({ where: { id } });
    if (!paciente) {
      throw new NotFoundException(`Paciente ${id} no encontrado`);
    }
    return paciente;
  }

  async getEstado(id: string): Promise<PacienteEstadoResponseDto> {
    const paciente = await this.pacientesRepository.findOne({ where: { id } });
    if (!paciente) {
      return { existe: false, activo: false };
    }
    return { existe: true, activo: paciente.activo };
  }

  async update(id: string, dto: UpdatePacienteDto): Promise<Paciente> {
    const paciente = await this.findOne(id);
    Object.assign(paciente, dto);
    return this.pacientesRepository.save(paciente);
  }
}
