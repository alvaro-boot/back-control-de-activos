import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ActivosService } from './activos.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('QR')
@Controller('qr/activo')
export class QrController {
  constructor(
    private readonly activosService: ActivosService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Redirigir a la página del frontend para ver el activo desde QR' })
  @ApiResponse({ status: 302, description: 'Redirección al frontend' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  async getActivoFromQR(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    // Verificar que el activo existe (sin requerir autenticación)
    try {
      await this.activosService.findOne(id);
    } catch (error) {
      // Si no existe, redirigir de todas formas al frontend que mostrará el error
    }
    
    // Redirigir al frontend (que manejará la autenticación)
    const frontendUrl = this.configService.get<string>('qr.baseUrl') || 'http://localhost:3001/activos/qr';
    res.redirect(`${frontendUrl}/${id}`);
  }
}
