import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { Slot, SlotEstado } from './entities/slot.entity';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ReservarSlotDto } from './dto/reservar-slot.dto';
import { LiberarSlotDto } from './dto/liberar-slot.dto';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico) private readonly medicosRepository: Repository<Medico>,
    @InjectRepository(Slot) private readonly slotsRepository: Repository<Slot>,
  ) {}

  create(dto: CreateMedicoDto): Promise<Medico> {
    const medico = this.medicosRepository.create(dto);
    return this.medicosRepository.save(medico);
  }

  findAll(especialidad?: string): Promise<Medico[]> {
    return this.medicosRepository.find({
      where: especialidad ? { especialidad } : {},
    });
  }

  async findOne(id: string): Promise<Medico> {
    const medico = await this.medicosRepository.findOne({ where: { id } });
    if (!medico) throw new NotFoundException(`Médico ${id} no encontrado`);
    return medico;
  }

  async crearSlot(medicoId: string, dto: CreateSlotDto): Promise<Slot> {
    await this.findOne(medicoId);
    const slot = this.slotsRepository.create({ ...dto, medicoId });
    return this.slotsRepository.save(slot);
  }

  async findSlots(medicoId: string, fecha?: string): Promise<Slot[]> {
    await this.findOne(medicoId);
    return this.slotsRepository.find({
      where: fecha ? { medicoId, fecha } : { medicoId },
      order: { horaInicio: 'ASC' },
    });
  }

  async reservar(slotId: string, dto: ReservarSlotDto): Promise<Slot> {
    const slot = await this.slotsRepository.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException(`Slot ${slotId} no encontrado`);
    if (slot.estado !== SlotEstado.DISPONIBLE) {
      throw new ConflictException(`El slot ${slotId} ya no está disponible`);
    }
    slot.estado = SlotEstado.RESERVADO;
    slot.citaId = dto.citaId;
    slot.pacienteId = dto.pacienteId;
    return this.slotsRepository.save(slot);
  }

  async liberar(slotId: string, dto: LiberarSlotDto): Promise<Slot> {
    const slot = await this.slotsRepository.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException(`Slot ${slotId} no encontrado`);
    slot.estado = SlotEstado.DISPONIBLE;
    slot.citaId = null;
    slot.pacienteId = null;
    void dto.motivo;
    return this.slotsRepository.save(slot);
  }

  async confirmar(slotId: string): Promise<Slot> {
    const slot = await this.slotsRepository.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException(`Slot ${slotId} no encontrado`);
    slot.estado = SlotEstado.OCUPADO;
    return this.slotsRepository.save(slot);
  }
}
