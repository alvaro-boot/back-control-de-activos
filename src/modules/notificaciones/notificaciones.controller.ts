import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  findAll(
    @CurrentUser() user: any,
    @Query('noLeidas') noLeidas?: string,
  ) {
    return this.notificacionesService.findAll(
      user.id,
      noLeidas === 'true',
    );
  }

  @Get('contar-no-leidas')
  @ApiOperation({ summary: 'Contar notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones no leídas' })
  contarNoLeidas(@CurrentUser() user: any) {
    return this.notificacionesService.contarNoLeidas(user.id);
  }

  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  marcarComoLeida(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.notificacionesService.marcarComoLeida(id, user.id);
  }

  @Patch('marcar-todas-leidas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  marcarTodasComoLeidas(@CurrentUser() user: any) {
    return this.notificacionesService.marcarTodasComoLeidas(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.notificacionesService.eliminar(id, user.id);
  }
}

