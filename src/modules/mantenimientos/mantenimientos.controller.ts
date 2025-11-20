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
import { MantenimientosService } from './mantenimientos.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mantenimientos')
@ApiBearerAuth()
@Controller('mantenimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear nuevo mantenimiento' })
  @ApiResponse({ status: 201, description: 'Mantenimiento creado' })
  create(@Body() createMantenimientoDto: CreateMantenimientoDto) {
    return this.mantenimientosService.create(createMantenimientoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mantenimientos' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos' })
  findAll(
    @Query('activoId') activoId?: string,
    @Query('tecnicoId') tecnicoId?: string,
  ) {
    return this.mantenimientosService.findAll(
      activoId ? parseInt(activoId, 10) : undefined,
      tecnicoId ? parseInt(tecnicoId, 10) : undefined,
    );
  }

  @Get('proximos')
  @ApiOperation({ summary: 'Obtener mantenimientos próximos' })
  @ApiResponse({ status: 200, description: 'Mantenimientos próximos' })
  getProximos(@Query('dias') dias?: string) {
    return this.mantenimientosService.getMantenimientosProximos(
      dias ? parseInt(dias, 10) : 7,
    );
  }

  @Get('historial/activo/:activoId')
  @ApiOperation({ summary: 'Obtener historial de mantenimientos de un activo' })
  @ApiResponse({ status: 200, description: 'Historial del activo' })
  getHistorialActivo(@Param('activoId', ParseIntPipe) activoId: number) {
    return this.mantenimientosService.getHistorialActivo(activoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mantenimiento por ID' })
  @ApiResponse({ status: 200, description: 'Mantenimiento encontrado' })
  @ApiResponse({ status: 404, description: 'Mantenimiento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Actualizar mantenimiento' })
  @ApiResponse({ status: 200, description: 'Mantenimiento actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMantenimientoDto: UpdateMantenimientoDto,
  ) {
    return this.mantenimientosService.update(id, updateMantenimientoDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar mantenimiento' })
  @ApiResponse({ status: 200, description: 'Mantenimiento eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosService.remove(id);
  }
}

