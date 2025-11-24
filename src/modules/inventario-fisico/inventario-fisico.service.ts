import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventarioFisico } from './entities/inventario-fisico.entity';
import { CreateInventarioFisicoDto } from './dto/create-inventario-fisico.dto';

@Injectable()
export class InventarioFisicoService {
  constructor(
    @InjectRepository(InventarioFisico)
    private inventarioFisicoRepository: Repository<InventarioFisico>,
  ) {}

  async confirmarActivo(
    activoId: number,
    usuarioId: number,
    observaciones?: string,
    ubicacionVerificada?: string,
  ): Promise<InventarioFisico> {
    // Verificar que el activo existe y está asignado al usuario
    // (esto se puede hacer consultando las asignaciones)

    const inventario = this.inventarioFisicoRepository.create({
      activoId,
      usuarioId,
      fechaInventario: new Date(),
      confirmado: true,
      observaciones,
      ubicacionVerificada,
    });

    return this.inventarioFisicoRepository.save(inventario);
  }

  async findAll(usuarioId?: number, fecha?: Date): Promise<InventarioFisico[]> {
    const queryBuilder = this.inventarioFisicoRepository
      .createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.activo', 'activo')
      .leftJoinAndSelect('inventario.usuario', 'usuario');

    if (usuarioId) {
      queryBuilder.andWhere('inventario.usuarioId = :usuarioId', { usuarioId });
    }

    if (fecha) {
      queryBuilder.andWhere('inventario.fechaInventario = :fecha', { fecha });
    }

    queryBuilder.orderBy('inventario.fechaInventario', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<InventarioFisico> {
    const inventario = await this.inventarioFisicoRepository.findOne({
      where: { id },
      relations: ['activo', 'usuario'],
    });

    if (!inventario) {
      throw new NotFoundException(`Registro de inventario con ID ${id} no encontrado`);
    }

    return inventario;
  }

  async getResumenInventario(empresaId?: number, fecha?: Date): Promise<any> {
    const queryBuilder = this.inventarioFisicoRepository
      .createQueryBuilder('inventario')
      .leftJoin('inventario.activo', 'activo')
      .select('COUNT(DISTINCT inventario.activoId)', 'activosVerificados')
      .addSelect('COUNT(inventario.id)', 'totalVerificaciones');

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    if (fecha) {
      queryBuilder.andWhere('inventario.fechaInventario = :fecha', { fecha });
    }

    return queryBuilder.getRawOne();
  }
}

