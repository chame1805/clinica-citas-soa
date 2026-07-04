import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ReservarSlotDto } from './dto/reservar-slot.dto';
import { LiberarSlotDto } from './dto/liberar-slot.dto';

@Controller()
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Post('medicos')
  create(@Body() dto: CreateMedicoDto) {
    return this.medicosService.create(dto);
  }

  @Get('medicos')
  findAll(@Query('especialidad') especialidad?: string) {
    return this.medicosService.findAll(especialidad);
  }

  @Get('medicos/:id')
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }

  @Post('medicos/:id/slots')
  crearSlot(@Param('id') id: string, @Body() dto: CreateSlotDto) {
    return this.medicosService.crearSlot(id, dto);
  }

  @Get('medicos/:id/slots')
  findSlots(@Param('id') id: string, @Query('fecha') fecha?: string) {
    return this.medicosService.findSlots(id, fecha);
  }

  @Post('slots/:id/reservar')
  reservar(@Param('id') id: string, @Body() dto: ReservarSlotDto) {
    return this.medicosService.reservar(id, dto);
  }

  @Post('slots/:id/liberar')
  liberar(@Param('id') id: string, @Body() dto: LiberarSlotDto) {
    return this.medicosService.liberar(id, dto);
  }
}
