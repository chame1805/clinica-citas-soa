import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Medico } from './medico.entity';

export enum SlotEstado {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADO = 'RESERVADO',
  OCUPADO = 'OCUPADO',
}

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medico, (medico) => medico.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column()
  medicoId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column()
  horaInicio: string;

  @Column()
  horaFin: string;

  @Column({ type: 'enum', enum: SlotEstado, default: SlotEstado.DISPONIBLE })
  estado: SlotEstado;

  @Column({ nullable: true, type: 'uuid' })
  citaId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  pacienteId: string | null;
}
