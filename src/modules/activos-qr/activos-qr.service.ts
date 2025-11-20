import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { ActivoQr } from './entities/activo-qr.entity';
import { Activo } from '../activos/entities/activo.entity';

@Injectable()
export class ActivosQrService {
  private readonly qrDirectory = path.join(process.cwd(), 'uploads', 'qr');

  constructor(
    @InjectRepository(ActivoQr)
    private activoQrRepository: Repository<ActivoQr>,
    @InjectRepository(Activo)
    private activoRepository: Repository<Activo>,
    private configService: ConfigService,
  ) {
    if (!fs.existsSync(this.qrDirectory)) {
      fs.mkdirSync(this.qrDirectory, { recursive: true });
    }
  }

  async generateQR(activoId: number): Promise<ActivoQr> {
    const activo = await this.activoRepository.findOne({
      where: { id: activoId },
    });

    if (!activo) {
      throw new NotFoundException(`Activo con ID ${activoId} no encontrado`);
    }

    const baseUrl = this.configService.get<string>('qr.baseUrl');
    const qrUrl = `${baseUrl}/${activoId}`;

    // Verificar si ya existe un QR
    let activoQr = await this.activoQrRepository.findOne({
      where: { activoId },
    });

    // Generar código QR
    const qrFileName = `activo_${activoId}_${Date.now()}.png`;
    const qrFilePath = path.join(this.qrDirectory, qrFileName);

    try {
      await QRCode.toFile(qrFilePath, qrUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1,
      });

      // Eliminar QR anterior si existe
      if (activoQr && activoQr.urlImagenQr) {
        const oldQrPath = path.join(process.cwd(), activoQr.urlImagenQr);
        if (fs.existsSync(oldQrPath)) {
          fs.unlinkSync(oldQrPath);
        }
      }

      // Crear o actualizar registro
      if (!activoQr) {
        activoQr = this.activoQrRepository.create({
          activoId,
          contenidoQr: qrUrl,
          urlImagenQr: `uploads/qr/${qrFileName}`,
        });
      } else {
        activoQr.contenidoQr = qrUrl;
        activoQr.urlImagenQr = `uploads/qr/${qrFileName}`;
      }

      return this.activoQrRepository.save(activoQr);
    } catch (error) {
      throw new Error(`Error al generar QR: ${error.message}`);
    }
  }

  async findByActivoId(activoId: number): Promise<ActivoQr> {
    const activoQr = await this.activoQrRepository.findOne({
      where: { activoId },
      relations: ['activo'],
    });

    if (!activoQr) {
      throw new NotFoundException(`QR para activo ${activoId} no encontrado`);
    }

    return activoQr;
  }

  async regenerateQR(activoId: number): Promise<ActivoQr> {
    return this.generateQR(activoId);
  }
}

