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
import { GarantiasService } from './garantias.service';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Garantías')
@ApiBearerAuth()
@Controller('garantias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GarantiasController {
  constructor(private readonly garantiasService: GarantiasService) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear garantía' })
  @ApiResponse({ status: 201, description: 'Garantía creada' })
  create(@Body() createGarantiaDto: CreateGarantiaDto) {
    return this.garantiasService.create(createGarantiaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las garantías' })
  @ApiResponse({ status: 200, description: 'Lista de garantías' })
  findAll() {
    return this.garantiasService.findAll();
  }

  @Get('activo/:activoId')
  @ApiOperation({ summary: 'Obtener garantía de un activo' })
  @ApiResponse({ status: 200, description: 'Garantía encontrada' })
  findByActivoId(@Param('activoId', ParseIntPipe) activoId: number) {
    return this.garantiasService.findByActivoId(activoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener garantía por ID' })
  @ApiResponse({ status: 200, description: 'Garantía encontrada' })
  @ApiResponse({ status: 404, description: 'Garantía no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.garantiasService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Actualizar garantía' })
  @ApiResponse({ status: 200, description: 'Garantía actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGarantiaDto: UpdateGarantiaDto,
  ) {
    return this.garantiasService.update(id, updateGarantiaDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar garantía' })
  @ApiResponse({ status: 200, description: 'Garantía eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.garantiasService.remove(id);
  }
}

