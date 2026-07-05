import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LiberarSlotDto {
  @ApiProperty()
  @IsUUID()
  citaId: string;

  @ApiProperty({ example: 'Paciente no válido' })
  @IsString()
  @IsNotEmpty()
  motivo: string;
}
