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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';

@ApiTags('Categorías')
@ApiBearerAuth()
@Controller('categorias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Crear nueva categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada' })
  create(
    @Body() createCategoriaDto: CreateCategoriaDto,
    @CurrentUser() user: any,
  ) {
    // Si no es admin del sistema, asignar automáticamente la empresa del usuario
    if (!AdminSistemaUtil.isAdminSistema(user) && user?.empresaId) {
      createCategoriaDto.empresaId = user.empresaId;
    }
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  findAll(
    @Query('empresaId') empresaId?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaIdFilter = AdminSistemaUtil.getEmpresaIdFilter(user, empresaId);
    return this.categoriasService.findAll(empresaIdFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Actualizar categoría' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
    @CurrentUser() user: any,
  ) {
    // Verificar que la categoría pertenece a la empresa del usuario
    const categoria = await this.categoriasService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && categoria.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes editar categorías de tu empresa');
    }
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar categoría' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Verificar que la categoría pertenece a la empresa del usuario
    const categoria = await this.categoriasService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && categoria.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes eliminar categorías de tu empresa');
    }
    return this.categoriasService.remove(id);
  }
}

