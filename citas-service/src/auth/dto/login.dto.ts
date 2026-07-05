import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'recepcion' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({ example: 'clinica123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
