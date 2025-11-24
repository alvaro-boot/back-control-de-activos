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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';

@ApiTags('Empresas')
@ApiBearerAuth()
@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Crear nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  findAll(@CurrentUser() user: any) {
    // Solo el administrador del sistema puede ver todas las empresas
    // Los demás usuarios solo ven su empresa
    if (AdminSistemaUtil.isAdminSistema(user)) {
      return this.empresasService.findAll();
    } else {
      // Retornar como array para mantener consistencia
      return this.empresasService.findOne(user?.empresaId).then(empresa => [empresa]);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Si no es admin del sistema, solo puede ver su propia empresa
    if (!AdminSistemaUtil.isAdminSistema(user) && user?.empresaId !== id) {
      throw new ForbiddenException('Solo puedes ver tu propia empresa');
    }
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Actualizar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @CurrentUser() user: any,
  ) {
    // Si no es admin del sistema, solo puede editar su propia empresa
    if (!AdminSistemaUtil.isAdminSistema(user) && user?.empresaId !== id) {
      throw new ForbiddenException('Solo puedes editar tu propia empresa');
    }
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.remove(id);
  }
}

