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
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions, Permission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';
import { TipoMantenimiento } from './entities/mantenimiento.entity';

@ApiTags('Mantenimientos')
@ApiBearerAuth()
@Controller('mantenimientos')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Post()
  @Roles('administrador', 'tecnico', 'administrador_sistema')
  @Permissions(Permission.MANTENIMIENTOS_CREATE)
  @ApiOperation({ summary: 'Crear nuevo mantenimiento' })
  @ApiResponse({ status: 201, description: 'Mantenimiento creado' })
  create(
    @Body() createMantenimientoDto: CreateMantenimientoDto,
    @CurrentUser() user: any,
  ) {
    // Los técnicos solo pueden crear mantenimientos correctivos
    const userRole = user?.rol?.nombre || user?.rol;
    if (userRole === 'tecnico') {
      // Si es técnico, usar su ID como tecnicoId
      createMantenimientoDto.tecnicoId = user.id;
      // Solo pueden crear correctivos
      if (createMantenimientoDto.tipo !== TipoMantenimiento.CORRECTIVO) {
        createMantenimientoDto.tipo = TipoMantenimiento.CORRECTIVO;
      }
    } else if (!createMantenimientoDto.tecnicoId) {
      // Si no es técnico y no se especifica tecnicoId, usar el usuario actual
      createMantenimientoDto.tecnicoId = user.id;
    }
    return this.mantenimientosService.create(createMantenimientoDto);
  }

  @Get()
  @Permissions(Permission.MANTENIMIENTOS_VIEW)
  @ApiOperation({ summary: 'Obtener todos los mantenimientos' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos' })
  findAll(
    @Query('activoId') activoId?: string,
    @Query('tecnicoId') tecnicoId?: string,
    @Query('empresaId') empresaId?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaIdFilter = AdminSistemaUtil.getEmpresaIdFilter(user, empresaId);
    const userRole = user?.rol?.nombre || user?.rol;
    
    // Los técnicos solo ven sus propios mantenimientos
    if (userRole === 'tecnico') {
      return this.mantenimientosService.findAll(
        activoId ? parseInt(activoId, 10) : undefined,
        user.id, // Forzar tecnicoId al usuario actual
        empresaIdFilter,
      );
    }
    
    return this.mantenimientosService.findAll(
      activoId ? parseInt(activoId, 10) : undefined,
      tecnicoId ? parseInt(tecnicoId, 10) : undefined,
      empresaIdFilter,
    );
  }


  @Get('historial/activo/:activoId')
  @Permissions(Permission.MANTENIMIENTOS_VIEW)
  @ApiOperation({ summary: 'Obtener historial de mantenimientos de un activo' })
  @ApiResponse({ status: 200, description: 'Historial del activo' })
  getHistorialActivo(@Param('activoId', ParseIntPipe) activoId: number) {
    return this.mantenimientosService.getHistorialActivo(activoId);
  }

  @Get(':id')
  @Permissions(Permission.MANTENIMIENTOS_VIEW)
  @ApiOperation({ summary: 'Obtener mantenimiento por ID' })
  @ApiResponse({ status: 200, description: 'Mantenimiento encontrado' })
  @ApiResponse({ status: 404, description: 'Mantenimiento no encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    const mantenimiento = this.mantenimientosService.findOne(id);
    const userRole = user?.rol?.nombre || user?.rol;
    
    // Los técnicos solo pueden ver sus propios mantenimientos
    if (userRole === 'tecnico') {
      return this.mantenimientosService.findOneForTecnico(id, user.id);
    }
    
    return mantenimiento;
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico', 'administrador_sistema')
  @Permissions(Permission.MANTENIMIENTOS_EDIT)
  @ApiOperation({ summary: 'Actualizar mantenimiento' })
  @ApiResponse({ status: 200, description: 'Mantenimiento actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMantenimientoDto: UpdateMantenimientoDto,
    @CurrentUser() user: any,
  ) {
    const userRole = user?.rol?.nombre || user?.rol;
    
    // Los técnicos solo pueden ejecutar mantenimientos (cambiar estado, agregar informes)
    if (userRole === 'tecnico') {
      return this.mantenimientosService.updateByTecnico(id, updateMantenimientoDto, user.id);
    }
    
    return this.mantenimientosService.update(id, updateMantenimientoDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.MANTENIMIENTOS_EDIT)
  @ApiOperation({ summary: 'Eliminar mantenimiento' })
  @ApiResponse({ status: 200, description: 'Mantenimiento eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosService.remove(id);
  }
}

