import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { DevolverAsignacionDto } from './dto/devolver-asignacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Asignaciones')
@ApiBearerAuth()
@Controller('asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Asignar activo a empleado' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  @ApiResponse({ status: 400, description: 'El activo ya está asignado' })
  create(
    @Body() createAsignacionDto: CreateAsignacionDto,
    @CurrentUser() user: any,
  ) {
    return this.asignacionesService.create(
      createAsignacionDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  findAll(
    @Query('activoId') activoId?: string,
    @Query('empleadoId') empleadoId?: string,
  ) {
    return this.asignacionesService.findAll(
      activoId ? parseInt(activoId, 10) : undefined,
      empleadoId ? parseInt(empleadoId, 10) : undefined,
    );
  }

  @Get('historial/activo/:activoId')
  @ApiOperation({ summary: 'Obtener historial de asignaciones de un activo' })
  @ApiResponse({ status: 200, description: 'Historial del activo' })
  getHistorialActivo(@Param('activoId', ParseIntPipe) activoId: number) {
    return this.asignacionesService.getHistorialActivo(activoId);
  }

  @Get('historial/empleado/:empleadoId')
  @ApiOperation({ summary: 'Obtener historial de asignaciones de un empleado' })
  @ApiResponse({ status: 200, description: 'Historial del empleado' })
  getHistorialEmpleado(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.asignacionesService.getHistorialEmpleado(empleadoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.findOne(id);
  }

  @Patch(':id/devolver')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Devolver activo asignado' })
  @ApiResponse({ status: 200, description: 'Asignación cerrada' })
  @ApiResponse({ status: 400, description: 'La asignación ya fue devuelta' })
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() devolverAsignacionDto: DevolverAsignacionDto,
    @CurrentUser() user: any,
  ) {
    return this.asignacionesService.devolver(
      id,
      devolverAsignacionDto,
      user.id,
    );
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar asignación' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.remove(id);
  }
}

