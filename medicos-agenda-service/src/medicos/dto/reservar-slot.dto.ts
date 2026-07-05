import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReservarSlotDto {
  @ApiProperty()
  @IsUUID()
  citaId: string;

  @ApiProperty()
  @IsUUID()
  pacienteId: string;
}
