import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ActivosService } from './activos.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('QR')
@Controller('qr/activo')
export class QrController {
  constructor(private readonly activosService: ActivosService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Ver información del activo desde QR (público)' })
  @ApiResponse({ status: 200, description: 'Información del activo' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  async getActivoFromQR(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const activo = await this.activosService.findOne(id);
    
    // Retornar HTML simple con la información del activo
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activo ${activo.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
          }
          .info-row {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-left: 4px solid #007bff;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .value {
            color: #333;
            margin-top: 5px;
          }
          .estado {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 5px;
          }
          .activo { background: #d4edda; color: #155724; }
          .mantenimiento { background: #fff3cd; color: #856404; }
          .retirado { background: #f8d7da; color: #721c24; }
          .perdido { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Activo ${activo.codigo || '#' + activo.id}</h1>
          <div class="info-row">
            <div class="label">Código:</div>
            <div class="value">${activo.codigo || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="label">Nombre:</div>
            <div class="value">${activo.nombre || 'N/A'}</div>
          </div>
          ${activo.descripcion ? `
          <div class="info-row">
            <div class="label">Descripción:</div>
            <div class="value">${activo.descripcion}</div>
          </div>
          ` : ''}
          ${activo.categoria ? `
          <div class="info-row">
            <div class="label">Categoría:</div>
            <div class="value">${activo.categoria.nombre}</div>
          </div>
          ` : ''}
          ${activo.sede ? `
          <div class="info-row">
            <div class="label">Sede:</div>
            <div class="value">${activo.sede.nombre}</div>
          </div>
          ` : ''}
          ${activo.area ? `
          <div class="info-row">
            <div class="label">Área:</div>
            <div class="value">${activo.area.nombre}</div>
          </div>
          ` : ''}
          ${activo.responsable ? `
          <div class="info-row">
            <div class="label">Responsable:</div>
            <div class="value">${activo.responsable.nombreCompleto}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="label">Valor de Compra:</div>
            <div class="value">$${activo.valorCompra ? activo.valorCompra.toLocaleString() : 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="label">Valor Actual:</div>
            <div class="value">$${activo.valorActual ? activo.valorActual.toLocaleString() : 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="label">Fecha de Compra:</div>
            <div class="value">${activo.fechaCompra ? new Date(activo.fechaCompra).toLocaleDateString('es-ES') : 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="label">Estado:</div>
            <div class="estado ${activo.estado}">${activo.estado.toUpperCase()}</div>
          </div>
          ${activo.empresa ? `
          <div class="info-row">
            <div class="label">Empresa:</div>
            <div class="value">${activo.empresa.nombre}</div>
          </div>
          ` : ''}
          ${activo.fechaCompra ? `
          <div class="info-row">
            <div class="label">Fecha de Compra:</div>
            <div class="value">${new Date(activo.fechaCompra).toLocaleDateString('es-ES')}</div>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    res.send(html);
  }
}

