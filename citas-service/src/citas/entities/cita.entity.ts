import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CitaEstado {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  FALLIDA = 'FALLIDA',
}

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @Column({ type: 'uuid' })
  medicoId: string;

  @Column({ type: 'uuid' })
  slotId: string;

  @Column()
  motivoConsulta: string;

  @Column({ type: 'enum', enum: CitaEstado, default: CitaEstado.PENDIENTE })
  estado: CitaEstado;

  @Column({ type: 'varchar', nullable: true })
  motivoFallo: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
