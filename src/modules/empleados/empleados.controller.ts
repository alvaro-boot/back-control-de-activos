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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminSistemaUtil } from '../../common/utils/admin-sistema.util';

@ApiTags('Empleados')
@ApiBearerAuth()
@Controller('empleados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Crear nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado' })
  create(
    @Body() createEmpleadoDto: CreateEmpleadoDto,
    @CurrentUser() user: any,
  ) {
    // Si no es admin del sistema, asignar automáticamente la empresa del usuario
    if (!AdminSistemaUtil.isAdminSistema(user) && user?.empresaId) {
      createEmpleadoDto.empresaId = user.empresaId;
    }
    return this.empleadosService.create(createEmpleadoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los empleados' })
  @ApiResponse({ status: 200, description: 'Lista de empleados' })
  findAll(
    @Query('empresaId') empresaId?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaIdFilter = AdminSistemaUtil.getEmpresaIdFilter(user, empresaId);
    return this.empleadosService.findAll(empresaIdFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empleado por ID' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Actualizar empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @CurrentUser() user: any,
  ) {
    // Verificar que el empleado pertenece a la empresa del usuario
    const empleado = await this.empleadosService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && empleado.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes editar empleados de tu empresa');
    }
    return this.empleadosService.update(id, updateEmpleadoDto);
  }

  @Delete(':id')
  @Roles('administrador', 'administrador_sistema')
  @ApiOperation({ summary: 'Eliminar empleado' })
  @ApiResponse({ status: 200, description: 'Empleado eliminado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Verificar que el empleado pertenece a la empresa del usuario
    const empleado = await this.empleadosService.findOne(id);
    if (!AdminSistemaUtil.isAdminSistema(user) && empleado.empresaId !== user?.empresaId) {
      throw new ForbiddenException('Solo puedes eliminar empleados de tu empresa');
    }
    return this.empleadosService.remove(id);
  }
}

