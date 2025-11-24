import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions, Permission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('depreciacion-mensual')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.REPORTES_FINANCIAL)
  @ApiOperation({ summary: 'Reporte de depreciación mensual' })
  @ApiResponse({ status: 200, description: 'Reporte de depreciación' })
  getDepreciacionMensual(
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.reportesService.getDepreciacionMensual(
      empresaId,
      mes ? parseInt(mes, 10) : undefined,
      anio ? parseInt(anio, 10) : undefined,
    );
  }

  @Get('comparativo-contable-fiscal')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.REPORTES_FINANCIAL)
  @ApiOperation({ summary: 'Comparativo contable vs fiscal' })
  @ApiResponse({ status: 200, description: 'Comparativo de depreciación' })
  getComparativoContableFiscal(@CurrentUser() user?: any) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.reportesService.getComparativoContableFiscal(empresaId);
  }

  @Get('activos-por-centro-costo')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.REPORTES_VIEW)
  @ApiOperation({ summary: 'Activos por centro de costo (área)' })
  @ApiResponse({ status: 200, description: 'Reporte de activos por área' })
  getActivosPorCentroCosto(@CurrentUser() user?: any) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.reportesService.getActivosPorCentroCosto(empresaId);
  }

  @Get('activos-por-responsable')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.REPORTES_VIEW)
  @ApiOperation({ summary: 'Activos por responsable' })
  @ApiResponse({ status: 200, description: 'Reporte de activos por responsable' })
  getActivosPorResponsable(@CurrentUser() user?: any) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.reportesService.getActivosPorResponsable(empresaId);
  }

  @Get('activos-por-estado')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.REPORTES_VIEW)
  @ApiOperation({ summary: 'Activos por estado' })
  @ApiResponse({ status: 200, description: 'Reporte de activos por estado' })
  getActivosPorEstado(@CurrentUser() user?: any) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.reportesService.getActivosPorEstado(empresaId);
  }

  @Get('inventario-fisico-vs-contable')
  @Roles('administrador', 'administrador_sistema')
  @Permissions(Permission.REPORTES_VIEW)
  @ApiOperation({ summary: 'Conciliación inventario físico vs contable' })
  @ApiResponse({ status: 200, description: 'Reporte de conciliación' })
  getInventarioFisicoVsContable(@CurrentUser() user?: any) {
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.reportesService.getInventarioFisicoVsContable(empresaId);
  }
}

