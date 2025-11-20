import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HistorialActivosService } from './historial-activos.service';
import { CreateHistorialActivoDto } from './dto/create-historial-activo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Historial de Activos')
@ApiBearerAuth()
@Controller('historial-activos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialActivosController {
  constructor(private readonly historialService: HistorialActivosService) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear registro en historial' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  create(@Body() createHistorialDto: CreateHistorialActivoDto) {
    return this.historialService.create(createHistorialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todo el historial' })
  @ApiResponse({ status: 200, description: 'Lista de historial' })
  findAll() {
    return this.historialService.findAll();
  }

  @Get('activo/:activoId')
  @ApiOperation({ summary: 'Obtener historial de un activo' })
  @ApiResponse({ status: 200, description: 'Historial del activo' })
  findByActivoId(@Param('activoId', ParseIntPipe) activoId: number) {
    return this.historialService.findByActivoId(activoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro de historial por ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
  }
}

