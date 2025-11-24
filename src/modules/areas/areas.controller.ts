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
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';
import { SedesService } from '../sedes/sedes.service';

@ApiTags('Áreas')
@ApiBearerAuth()
@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
    private readonly sedesService: SedesService,
  ) {}

  @Post()
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Crear nueva área' })
  @ApiResponse({ status: 201, description: 'Área creada' })
  async create(
    @Body() createAreaDto: CreateAreaDto,
    @CurrentUser() user: any,
  ) {
    // Verificar que la sede pertenece a la empresa del usuario
    if (!AdminSistemaUtil.isAdminSistema(user) && createAreaDto.sedeId) {
      const sede = await this.sedesService.findOne(createAreaDto.sedeId);
      if (sede.empresaId !== user?.empresaId) {
        throw new ForbiddenException('La sede debe pertenecer a tu empresa');
      }
    }
    return this.areasService.create(createAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las áreas' })
  @ApiResponse({ status: 200, description: 'Lista de áreas' })
  findAll(
    @Query('sedeId') sedeId?: string,
    @Query('empresaId') empresaId?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaIdFilter = AdminSistemaUtil.getEmpresaIdFilter(user, empresaId);
    return this.areasService.findAll(
      sedeId ? parseInt(sedeId, 10) : undefined,
      empresaIdFilter,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener área por ID' })
  @ApiResponse({ status: 200, description: 'Área encontrada' })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Actualizar área' })
  @ApiResponse({ status: 200, description: 'Área actualizada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaDto: UpdateAreaDto,
    @CurrentUser() user: any,
  ) {
    // Verificar que el área pertenece a la empresa del usuario
    const area = await this.areasService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && area.sede?.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes editar áreas de tu empresa');
    }
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar área' })
  @ApiResponse({ status: 200, description: 'Área eliminada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Verificar que el área pertenece a la empresa del usuario
    const area = await this.areasService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && area.sede?.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes eliminar áreas de tu empresa');
    }
    return this.areasService.remove(id);
  }
}

