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
import { AdminSistemaService } from './admin-sistema.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EmpresasService } from '../empresas/empresas.service';
import { CreateEmpresaDto } from '../empresas/dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../empresas/dto/update-empresa.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../usuarios/dto/update-usuario.dto';

@ApiTags('Admin Sistema')
@ApiBearerAuth()
@Controller('admin-sistema')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador_sistema')
export class AdminSistemaController {
  constructor(
    private readonly adminSistemaService: AdminSistemaService,
    private readonly usuariosService: UsuariosService,
    private readonly empresasService: EmpresasService,
  ) {}

  // ============================================
  // DASHBOARD GLOBAL
  // ============================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener estadísticas globales del sistema' })
  @ApiResponse({ status: 200, description: 'Estadísticas del dashboard' })
  getDashboard() {
    return this.adminSistemaService.getDashboardStats();
  }

  // ============================================
  // GESTIÓN DE EMPRESAS
  // ============================================

  @Get('empresas')
  @ApiOperation({ summary: 'Obtener todas las empresas (vista detallada)' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  getAllEmpresas() {
    return this.empresasService.findAll();
  }

  @Get('empresas/:id')
  @ApiOperation({ summary: 'Obtener empresa con detalles completos' })
  @ApiResponse({ status: 200, description: 'Empresa con estadísticas' })
  getEmpresaDetallada(@Param('id', ParseIntPipe) id: number) {
    return this.adminSistemaService.getEmpresaDetallada(id);
  }

  @Post('empresas')
  @ApiOperation({ summary: 'Crear nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada' })
  createEmpresa(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Patch('empresas/:id')
  @ApiOperation({ summary: 'Actualizar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada' })
  updateEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Patch('empresas/:id/toggle-activa')
  @ApiOperation({ summary: 'Activar/Desactivar empresa' })
  @ApiResponse({ status: 200, description: 'Estado de empresa actualizado' })
  toggleEmpresaActiva(
    @Param('id', ParseIntPipe) id: number,
    @Body('activa') activa: boolean,
  ) {
    return this.adminSistemaService.toggleEmpresaActiva(id, activa);
  }

  @Delete('empresas/:id')
  @ApiOperation({ summary: 'Eliminar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada' })
  deleteEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.remove(id);
  }

  // ============================================
  // GESTIÓN GLOBAL DE USUARIOS
  // ============================================

  @Get('usuarios')
  @ApiOperation({ summary: 'Obtener todos los usuarios del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  getAllUsuarios(@Query('empresaId') empresaId?: string) {
    if (empresaId) {
      return this.usuariosService.findAll(Number(empresaId));
    }
    return this.usuariosService.findAllGlobal();
  }

  @Get('usuarios/:id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  getUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post('usuarios')
  @ApiOperation({ summary: 'Crear usuario asignándolo a una empresa' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  createUsuario(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Patch('usuarios/:id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch('usuarios/:id/reset-password')
  @ApiOperation({ summary: 'Resetear contraseña de usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña reseteada' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
  ) {
    return this.usuariosService.resetPassword(id, password);
  }

  @Patch('usuarios/:id/toggle-activo')
  @ApiOperation({ summary: 'Bloquear/Desbloquear usuario' })
  @ApiResponse({ status: 200, description: 'Estado de usuario actualizado' })
  toggleUsuarioActivo(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.usuariosService.toggleActivo(id, activo);
  }

  @Patch('usuarios/:id/cambiar-empresa')
  @ApiOperation({ summary: 'Cambiar empresa de un usuario' })
  @ApiResponse({ status: 200, description: 'Empresa cambiada' })
  cambiarEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Body('empresaId') empresaId: number,
  ) {
    return this.usuariosService.cambiarEmpresa(id, empresaId);
  }

  @Patch('usuarios/:id/cambiar-rol')
  @ApiOperation({ summary: 'Cambiar rol de un usuario' })
  @ApiResponse({ status: 200, description: 'Rol cambiado' })
  cambiarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body('rolId') rolId: number,
  ) {
    return this.usuariosService.cambiarRol(id, rolId);
  }

  @Delete('usuarios/:id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}

