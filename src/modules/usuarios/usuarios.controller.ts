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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';
import { RolesService } from '../roles/roles.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: UsuarioResponseDto })
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @CurrentUser() user: any,
  ) {
    // Obtener el rol que se está intentando asignar
    const rolToAssign = await this.rolesService.findOne(createUsuarioDto.rolId);
    if (!rolToAssign) {
      throw new BadRequestException('Rol no encontrado');
    }

    const userRole = user.rol?.nombre || user.role;

    // Solo el Super Admin puede crear administradores
    if (rolToAssign.nombre === 'administrador' && userRole !== 'administrador_sistema') {
      throw new ForbiddenException('Solo el Super Admin puede crear administradores');
    }

    // Los administradores solo pueden crear técnicos
    if (userRole === 'administrador' && rolToAssign.nombre !== 'tecnico') {
      throw new ForbiddenException('Los administradores solo pueden crear técnicos');
    }

    // Si el usuario es administrador, asegurar que el nuevo usuario pertenezca a su empresa
    if (userRole === 'administrador') {
      createUsuarioDto.empresaId = user.empresaId;
    }

    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [UsuarioResponseDto] })
  findAll(@CurrentUser() user: any) {
    // El administrador del sistema ve todos, otros solo de su empresa
    const empresaId = AdminSistemaUtil.getEmpresaIdFilter(user);
    return this.usuariosService.findAll(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UsuarioResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UsuarioResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Obtener el rol del usuario actual (puede venir de diferentes formas)
    const userRole = user.rol?.nombre || user.role?.nombre || user.role;
    const userId = user.id || user.sub;

    // Obtener el usuario a eliminar
    const usuarioToDelete = await this.usuariosService.findOne(id);

    // No permitir que un usuario se elimine a sí mismo
    if (userId === usuarioToDelete.id) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }

    // Obtener el rol del usuario a eliminar
    const rolToDelete = await this.rolesService.findOne(usuarioToDelete.rolId);
    if (!rolToDelete) {
      throw new BadRequestException('Rol del usuario no encontrado');
    }

    // Solo el Super Admin puede eliminar administradores
    if (rolToDelete.nombre === 'administrador' && userRole !== 'administrador_sistema') {
      throw new ForbiddenException('Solo el Super Admin puede eliminar administradores');
    }

    // Los administradores solo pueden eliminar usuarios de su empresa
    const userEmpresaId = user.empresaId || user.empresa?.id;
    if (userRole === 'administrador' && usuarioToDelete.empresaId !== userEmpresaId) {
      throw new ForbiddenException('Solo puedes eliminar usuarios de tu empresa');
    }

    // Los administradores no pueden eliminar a otros administradores
    if (userRole === 'administrador' && rolToDelete.nombre === 'administrador') {
      throw new ForbiddenException('No puedes eliminar administradores');
    }

    return this.usuariosService.remove(id);
  }
}

