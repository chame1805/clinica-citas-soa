import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCitaDto {
  @ApiProperty()
  @IsUUID()
  pacienteId: string;

  @ApiProperty()
  @IsUUID()
  medicoId: string;

  @ApiProperty()
  @IsUUID()
  slotId: string;

  @ApiProperty({ example: 'Control anual' })
  @IsString()
  @IsNotEmpty()
  motivoConsulta: string;
}
