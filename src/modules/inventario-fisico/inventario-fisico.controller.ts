import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventarioFisicoService } from './inventario-fisico.service';
import { CreateInventarioFisicoDto } from './dto/create-inventario-fisico.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions, Permission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';

@ApiTags('Inventario Físico')
@ApiBearerAuth()
@Controller('inventario-fisico')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class InventarioFisicoController {
  constructor(private readonly inventarioFisicoService: InventarioFisicoService) {}

  @Post('confirmar')
  @Roles('administrador', 'empleado', 'administrador_sistema')
  @Permissions(Permission.INVENTARIO_PHYSICAL)
  @ApiOperation({ summary: 'Confirmar activo en inventario físico' })
  @ApiResponse({ status: 201, description: 'Activo confirmado en inventario' })
  confirmarActivo(
    @Body() createDto: CreateInventarioFisicoDto,
    @CurrentUser() user: any,
  ) {
    return this.inventarioFisicoService.confirmarActivo(
      createDto.activoId,
      user.id,
      createDto.observaciones,
      createDto.ubicacionVerificada,
    );
  }

  @Get()
  @Roles('administrador', 'empleado', 'administrador_sistema')
  @Permissions(Permission.INVENTARIO_VIEW)
  @ApiOperation({ summary: 'Obtener registros de inventario físico' })
  @ApiResponse({ status: 200, description: 'Lista de registros de inventario' })
  findAll(
    @Query('fecha') fecha?: string,
    @CurrentUser() user?: any,
  ) {
    const fechaDate = fecha ? new Date(fecha) : undefined;
    const usuarioId = user?.rol?.nombre === 'administrador' || user?.rol?.nombre === 'administrador_sistema' 
      ? undefined 
      : user?.id;
    return this.inventarioFisicoService.findAll(usuarioId, fechaDate);
  }

  @Get('resumen')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.INVENTARIO_VIEW)
  @ApiOperation({ summary: 'Obtener resumen de inventario físico' })
  @ApiResponse({ status: 200, description: 'Resumen de inventario' })
  getResumen(
    @Query('fecha') fecha?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    const fechaDate = fecha ? new Date(fecha) : undefined;
    return this.inventarioFisicoService.getResumenInventario(empresaId, fechaDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro de inventario por ID' })
  @ApiResponse({ status: 200, description: 'Registro de inventario encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioFisicoService.findOne(id);
  }
}

