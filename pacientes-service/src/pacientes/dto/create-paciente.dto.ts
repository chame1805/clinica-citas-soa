import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePacienteDto {
  @ApiProperty({ example: 'Ana' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: '1998-04-12' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ example: 'CC-123456789' })
  @IsString()
  @IsNotEmpty()
  documentoIdentidad: string;

  @ApiProperty({ example: 'ana.garcia@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+50588887777' })
  @IsString()
  @IsNotEmpty()
  telefono: string;
}
