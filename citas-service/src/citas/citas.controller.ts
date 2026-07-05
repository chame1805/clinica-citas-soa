import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar una cita — orquesta la Saga de confirmación' })
  create(@Body() dto: CreateCitaDto) {
    return this.citasService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar el estado de una cita' })
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar citas de un paciente' })
  findByPaciente(@Query('pacienteId') pacienteId: string) {
    return this.citasService.findByPaciente(pacienteId);
  }
}
