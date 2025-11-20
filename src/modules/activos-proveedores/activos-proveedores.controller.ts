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
import { ActivosProveedoresService } from './activos-proveedores.service';
import { CreateActivoProveedorDto } from './dto/create-activo-proveedor.dto';
import { UpdateActivoProveedorDto } from './dto/update-activo-proveedor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Activos-Proveedores')
@ApiBearerAuth()
@Controller('activos-proveedores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivosProveedoresController {
  constructor(
    private readonly activosProveedoresService: ActivosProveedoresService,
  ) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear relación activo-proveedor' })
  @ApiResponse({ status: 201, description: 'Relación creada' })
  create(@Body() createDto: CreateActivoProveedorDto) {
    return this.activosProveedoresService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las relaciones activo-proveedor' })
  @ApiResponse({ status: 200, description: 'Lista de relaciones' })
  findAll(
    @Query('activoId') activoId?: string,
    @Query('proveedorId') proveedorId?: string,
  ) {
    return this.activosProveedoresService.findAll(
      activoId ? parseInt(activoId, 10) : undefined,
      proveedorId ? parseInt(proveedorId, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener relación por ID' })
  @ApiResponse({ status: 200, description: 'Relación encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activosProveedoresService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Actualizar relación activo-proveedor' })
  @ApiResponse({ status: 200, description: 'Relación actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateActivoProveedorDto,
  ) {
    return this.activosProveedoresService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar relación activo-proveedor' })
  @ApiResponse({ status: 200, description: 'Relación eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activosProveedoresService.remove(id);
  }
}

