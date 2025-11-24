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
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions, Permission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';
import { EstadoSolicitud } from './entities/solicitud.entity';

@ApiTags('Solicitudes')
@ApiBearerAuth()
@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @Roles('administrador', 'tecnico', 'empleado', 'administrador_sistema')
  @Permissions(Permission.ASIGNACIONES_VIEW)
  @ApiOperation({ summary: 'Crear nueva solicitud' })
  @ApiResponse({ status: 201, description: 'Solicitud creada' })
  create(
    @Body() createSolicitudDto: CreateSolicitudDto,
    @CurrentUser() user: any,
  ) {
    return this.solicitudesService.create(createSolicitudDto, user.id);
  }

  @Get()
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.APROBACIONES_VIEW)
  @ApiOperation({ summary: 'Obtener todas las solicitudes' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  findAll(
    @Query('estado') estado?: EstadoSolicitud,
    @CurrentUser() user?: any,
  ) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.solicitudesService.findAll(empresaId, estado);
  }

  @Get('mis-solicitudes')
  @Roles('administrador', 'tecnico', 'empleado', 'administrador_sistema')
  @ApiOperation({ summary: 'Obtener mis solicitudes' })
  @ApiResponse({ status: 200, description: 'Lista de mis solicitudes' })
  findMisSolicitudes(@CurrentUser() user: any) {
    // Los usuarios solo ven sus propias solicitudes
    return this.solicitudesService.findAll(user.empresaId).then(solicitudes =>
      solicitudes.filter(s => s.solicitanteId === user.id)
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.findOne(id);
  }

  @Patch(':id/aprobar')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.APROBACIONES_APPROVE)
  @ApiOperation({ summary: 'Aprobar solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud aprobada' })
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.solicitudesService.aprobar(id, user.id, observaciones);
  }

  @Patch(':id/rechazar')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.APROBACIONES_APPROVE)
  @ApiOperation({ summary: 'Rechazar solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud rechazada' })
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body('observaciones') observaciones: string,
  ) {
    return this.solicitudesService.rechazar(id, user.id, observaciones);
  }

  @Patch(':id/completar')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Completar solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud completada' })
  completar(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.completar(id);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.remove(id);
  }
}

