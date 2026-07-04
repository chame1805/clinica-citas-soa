import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Slot } from './slot.entity';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  especialidad: string;

  @Column({ unique: true })
  cedulaProfesional: string;

  @OneToMany(() => Slot, (slot) => slot.medico)
  slots: Slot[];

  @CreateDateColumn()
  createdAt: Date;
}
