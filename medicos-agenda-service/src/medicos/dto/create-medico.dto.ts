import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicoDto {
  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: 'Cardiología' })
  @IsString()
  @IsNotEmpty()
  especialidad: string;

  @ApiProperty({ example: 'MED-00123' })
  @IsString()
  @IsNotEmpty()
  cedulaProfesional: string;
}
