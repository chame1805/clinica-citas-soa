import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ReservarSlotDto } from './dto/reservar-slot.dto';
import { LiberarSlotDto } from './dto/liberar-slot.dto';

@ApiTags('medicos-agenda')
@Controller()
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Post('medicos')
  @ApiOperation({ summary: 'Registrar un médico' })
  create(@Body() dto: CreateMedicoDto) {
    return this.medicosService.create(dto);
  }

  @Get('medicos')
  @ApiOperation({ summary: 'Listar médicos (filtro opcional por especialidad)' })
  findAll(@Query('especialidad') especialidad?: string) {
    return this.medicosService.findAll(especialidad);
  }

  @Get('medicos/:id')
  @ApiOperation({ summary: 'Obtener un médico por id' })
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }

  @Post('medicos/:id/slots')
  @ApiOperation({ summary: 'Crear un slot de disponibilidad para un médico' })
  crearSlot(@Param('id') id: string, @Body() dto: CreateSlotDto) {
    return this.medicosService.crearSlot(id, dto);
  }

  @Get('medicos/:id/slots')
  @ApiOperation({ summary: 'Consultar disponibilidad de horarios de un médico' })
  findSlots(@Param('id') id: string, @Query('fecha') fecha?: string) {
    return this.medicosService.findSlots(id, fecha);
  }

  @Post('slots/:id/reservar')
  @ApiOperation({ summary: 'Reservar un slot — llamado por citas-service' })
  reservar(@Param('id') id: string, @Body() dto: ReservarSlotDto) {
    return this.medicosService.reservar(id, dto);
  }

  @Post('slots/:id/liberar')
  @ApiOperation({ summary: 'Liberar un slot reservado — compensación de la Saga' })
  liberar(@Param('id') id: string, @Body() dto: LiberarSlotDto) {
    return this.medicosService.liberar(id, dto);
  }
}
