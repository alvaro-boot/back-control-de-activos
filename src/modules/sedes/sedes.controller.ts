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
import { SedesService } from './sedes.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';

@ApiTags('Sedes')
@ApiBearerAuth()
@Controller('sedes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Post()
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Crear nueva sede' })
  @ApiResponse({ status: 201, description: 'Sede creada' })
  create(
    @Body() createSedeDto: CreateSedeDto,
    @CurrentUser() user: any,
  ) {
    // Si no es admin del sistema, asignar automáticamente la empresa del usuario
    if (!AdminSistemaUtil.isAdminSistema(user) && user?.empresaId) {
      createSedeDto.empresaId = user.empresaId;
    }
    return this.sedesService.create(createSedeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sedes' })
  @ApiResponse({ status: 200, description: 'Lista de sedes' })
  findAll(
    @Query('empresaId') empresaId?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaIdFilter = AdminSistemaUtil.getEmpresaIdFilter(user, empresaId);
    return this.sedesService.findAll(empresaIdFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sede por ID' })
  @ApiResponse({ status: 200, description: 'Sede encontrada' })
  @ApiResponse({ status: 404, description: 'Sede no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Actualizar sede' })
  @ApiResponse({ status: 200, description: 'Sede actualizada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto,
    @CurrentUser() user: any,
  ) {
    // Verificar que la sede pertenece a la empresa del usuario
    const sede = await this.sedesService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && sede.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes editar sedes de tu empresa');
    }
    return this.sedesService.update(id, updateSedeDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar sede' })
  @ApiResponse({ status: 200, description: 'Sede eliminada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Verificar que la sede pertenece a la empresa del usuario
    const sede = await this.sedesService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && sede.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes eliminar sedes de tu empresa');
    }
    return this.sedesService.remove(id);
  }
}

