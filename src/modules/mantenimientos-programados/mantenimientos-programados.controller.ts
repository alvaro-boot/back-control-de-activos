import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MantenimientosProgramadosService } from './mantenimientos-programados.service';
import { CreateMantenimientoProgramadoDto } from './dto/create-mantenimiento-programado.dto';
import { UpdateMantenimientoProgramadoDto } from './dto/update-mantenimiento-programado.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mantenimientos Programados')
@ApiBearerAuth()
@Controller('mantenimientos-programados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MantenimientosProgramadosController {
  constructor(
    private readonly mantenimientosProgramadosService: MantenimientosProgramadosService,
  ) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear mantenimiento programado' })
  @ApiResponse({ status: 201, description: 'Mantenimiento programado creado' })
  create(@Body() createDto: CreateMantenimientoProgramadoDto) {
    return this.mantenimientosProgramadosService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mantenimientos programados' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos programados' })
  findAll(
    @Query('activoId') activoId?: string,
    @Query('tecnicoId') tecnicoId?: string,
  ) {
    return this.mantenimientosProgramadosService.findAll(
      activoId ? parseInt(activoId, 10) : undefined,
      tecnicoId ? parseInt(tecnicoId, 10) : undefined,
    );
  }

  @Get('proximos')
  @ApiOperation({ summary: 'Obtener mantenimientos programados próximos' })
  @ApiResponse({ status: 200, description: 'Mantenimientos próximos' })
  getProximos(@Query('dias') dias?: string) {
    return this.mantenimientosProgramadosService.getProximos(
      dias ? parseInt(dias, 10) : 7,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mantenimiento programado por ID' })
  @ApiResponse({ status: 200, description: 'Mantenimiento encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosProgramadosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Actualizar mantenimiento programado' })
  @ApiResponse({ status: 200, description: 'Mantenimiento actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMantenimientoProgramadoDto,
  ) {
    return this.mantenimientosProgramadosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar mantenimiento programado' })
  @ApiResponse({ status: 200, description: 'Mantenimiento eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosProgramadosService.remove(id);
  }
}

