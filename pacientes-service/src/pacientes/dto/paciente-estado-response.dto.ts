import { ApiProperty } from '@nestjs/swagger';

export class PacienteEstadoResponseDto {
  @ApiProperty()
  existe: boolean;

  @ApiProperty()
  activo: boolean;
}
