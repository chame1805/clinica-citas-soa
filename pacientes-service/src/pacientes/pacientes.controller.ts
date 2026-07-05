import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { Paciente } from './entities/paciente.entity';
import { PacienteEstadoResponseDto } from './dto/paciente-estado-response.dto';

@ApiTags('pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente creado', type: Paciente })
  create(@Body() dto: CreatePacienteDto) {
    return this.pacientesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes' })
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id/estado')
  @ApiOperation({ summary: 'Validar existencia y estado del paciente (usado por citas-service)' })
  @ApiResponse({ status: 200, type: PacienteEstadoResponseDto })
  getEstado(@Param('id') id: string) {
    return this.pacientesService.getEstado(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un paciente por id' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un paciente' })
  update(@Param('id') id: string, @Body() dto: UpdatePacienteDto) {
    return this.pacientesService.update(id, dto);
  }
}
