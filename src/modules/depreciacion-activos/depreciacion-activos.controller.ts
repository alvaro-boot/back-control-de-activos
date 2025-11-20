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
import { DepreciacionActivosService } from './depreciacion-activos.service';
import { CreateDepreciacionActivoDto } from './dto/create-depreciacion-activo.dto';
import { UpdateDepreciacionActivoDto } from './dto/update-depreciacion-activo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Depreciación de Activos')
@ApiBearerAuth()
@Controller('depreciacion-activos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepreciacionActivosController {
  constructor(
    private readonly depreciacionActivosService: DepreciacionActivosService,
  ) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear registro de depreciación' })
  @ApiResponse({ status: 201, description: 'Depreciación creada' })
  create(@Body() createDto: CreateDepreciacionActivoDto) {
    return this.depreciacionActivosService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las depreciaciones' })
  @ApiResponse({ status: 200, description: 'Lista de depreciaciones' })
  findAll(@Query('activoId') activoId?: string) {
    return this.depreciacionActivosService.findAll(
      activoId ? parseInt(activoId, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener depreciación por ID' })
  @ApiResponse({ status: 200, description: 'Depreciación encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.depreciacionActivosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Actualizar depreciación' })
  @ApiResponse({ status: 200, description: 'Depreciación actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDepreciacionActivoDto,
  ) {
    return this.depreciacionActivosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar depreciación' })
  @ApiResponse({ status: 200, description: 'Depreciación eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.depreciacionActivosService.remove(id);
  }
}

