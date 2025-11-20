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
  Post as PostMethod,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Activos')
@ApiBearerAuth()
@Controller('activos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Post()
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Crear nuevo activo' })
  @ApiResponse({ status: 201, description: 'Activo creado' })
  create(
    @Body() createActivoDto: CreateActivoDto,
    @CurrentUser() user: any,
  ) {
    return this.activosService.create(createActivoDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los activos' })
  @ApiResponse({ status: 200, description: 'Lista de activos' })
  findAll(
    @Query('empresaId') empresaId?: string,
    @CurrentUser() user?: any,
  ) {
    const empresaIdFilter = empresaId
      ? parseInt(empresaId, 10)
      : user?.empresaId;
    return this.activosService.findAll(empresaIdFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener activo por ID' })
  @ApiResponse({ status: 200, description: 'Activo encontrado' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Actualizar activo' })
  @ApiResponse({ status: 200, description: 'Activo actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivoDto: UpdateActivoDto,
    @CurrentUser() user: any,
  ) {
    return this.activosService.update(id, updateActivoDto, user.id);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar activo' })
  @ApiResponse({ status: 200, description: 'Activo eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activosService.remove(id);
  }

  @PostMethod(':id/regenerar-qr')
  @Roles('administrador', 'tecnico')
  @ApiOperation({ summary: 'Regenerar código QR del activo' })
  @ApiResponse({ status: 200, description: 'QR regenerado' })
  regenerateQR(@Param('id', ParseIntPipe) id: number) {
    return this.activosService.regenerateQR(id);
  }
}

