import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotDto {
  @ApiProperty({ example: '2026-07-10' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @ApiProperty({ example: '09:30' })
  @IsString()
  @IsNotEmpty()
  horaFin: string;
}
