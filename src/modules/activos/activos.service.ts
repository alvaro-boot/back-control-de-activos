import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { Activo, EstadoActivo } from './entities/activo.entity';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';

@Injectable()
export class ActivosService {
  private readonly qrDirectory = path.join(process.cwd(), 'uploads', 'qr');

  constructor(
    @InjectRepository(Activo)
    private activoRepository: Repository<Activo>,
    private configService: ConfigService,
  ) {
    // Asegurar que el directorio de QR existe
    if (!fs.existsSync(this.qrDirectory)) {
      fs.mkdirSync(this.qrDirectory, { recursive: true });
    }
  }

  async create(createActivoDto: CreateActivoDto): Promise<Activo> {
    const activo = this.activoRepository.create(createActivoDto);
    const savedActivo = await this.activoRepository.save(activo);

    // Generar QR después de crear el activo
    await this.generateQR(savedActivo.id);

    // Recargar con el QR actualizado
    return this.findOne(savedActivo.id);
  }

  async findAll(empresaId?: number): Promise<Activo[]> {
    const where = empresaId ? { empresaId } : {};
    return this.activoRepository.find({
      where,
      relations: ['empresa', 'asignaciones', 'mantenimientos'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Activo> {
    const activo = await this.activoRepository.findOne({
      where: { id },
      relations: [
        'empresa',
        'asignaciones',
        'asignaciones.empleado',
        'asignaciones.entregadoPor',
        'mantenimientos',
        'mantenimientos.tecnico',
      ],
    });

    if (!activo) {
      throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    }

    return activo;
  }

  async update(id: number, updateActivoDto: UpdateActivoDto): Promise<Activo> {
    const activo = await this.findOne(id);
    Object.assign(activo, updateActivoDto);
    return this.activoRepository.save(activo);
  }

  async remove(id: number): Promise<void> {
    const activo = await this.findOne(id);

    // Eliminar imagen QR si existe
    if (activo.qrImagen) {
      const qrPath = path.join(process.cwd(), activo.qrImagen);
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
    }

    await this.activoRepository.remove(activo);
  }

  async generateQR(activoId: number): Promise<void> {
    const activo = await this.findOne(activoId);
    const baseUrl = this.configService.get<string>('qr.baseUrl');
    const qrUrl = `${baseUrl}/${activoId}`;

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
      if (activo.qrImagen) {
        const oldQrPath = path.join(process.cwd(), activo.qrImagen);
        if (fs.existsSync(oldQrPath)) {
          fs.unlinkSync(oldQrPath);
        }
      }

      // Actualizar activo con nueva URL e imagen
      activo.qrUrl = qrUrl;
      activo.qrImagen = `uploads/qr/${qrFileName}`;
      await this.activoRepository.save(activo);
    } catch (error) {
      throw new Error(`Error al generar QR: ${error.message}`);
    }
  }

  async regenerateQR(activoId: number): Promise<Activo> {
    await this.generateQR(activoId);
    return this.findOne(activoId);
  }
}

