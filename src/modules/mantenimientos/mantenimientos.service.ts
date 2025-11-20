import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Mantenimiento, EstadoMantenimiento } from './entities/mantenimiento.entity';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';

@Injectable()
export class MantenimientosService {
  constructor(
    @InjectRepository(Mantenimiento)
    private mantenimientoRepository: Repository<Mantenimiento>,
  ) {}

  async create(createMantenimientoDto: CreateMantenimientoDto): Promise<Mantenimiento> {
    const mantenimiento = this.mantenimientoRepository.create({
      ...createMantenimientoDto,
      fechaProgramada: new Date(createMantenimientoDto.fechaProgramada),
      estado: createMantenimientoDto.estado || EstadoMantenimiento.PROGRAMADO,
    });

    return this.mantenimientoRepository.save(mantenimiento);
  }

  async findAll(activoId?: number, tecnicoId?: number): Promise<Mantenimiento[]> {
    const where: any = {};
    if (activoId) where.activoId = activoId;
    if (tecnicoId) where.tecnicoId = tecnicoId;

    return this.mantenimientoRepository.find({
      where,
      relations: ['activo', 'tecnico', 'tecnico.role'],
      order: { fechaProgramada: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Mantenimiento> {
    const mantenimiento = await this.mantenimientoRepository.findOne({
      where: { id },
      relations: ['activo', 'tecnico', 'tecnico.role'],
    });

    if (!mantenimiento) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }

    return mantenimiento;
  }

  async update(
    id: number,
    updateMantenimientoDto: UpdateMantenimientoDto,
  ): Promise<Mantenimiento> {
    const mantenimiento = await this.findOne(id);

    if (updateMantenimientoDto.fechaProgramada) {
      mantenimiento.fechaProgramada = new Date(
        updateMantenimientoDto.fechaProgramada,
      );
    }

    if (updateMantenimientoDto.fechaRealizacion) {
      mantenimiento.fechaRealizacion = new Date(
        updateMantenimientoDto.fechaRealizacion,
      );
    }

    if (updateMantenimientoDto.estado) {
      mantenimiento.estado = updateMantenimientoDto.estado;
    }

    if (updateMantenimientoDto.descripcion) {
      mantenimiento.descripcion = updateMantenimientoDto.descripcion;
    }

    if (updateMantenimientoDto.tecnicoId) {
      mantenimiento.tecnicoId = updateMantenimientoDto.tecnicoId;
    }

    return this.mantenimientoRepository.save(mantenimiento);
  }

  async remove(id: number): Promise<void> {
    const mantenimiento = await this.findOne(id);
    await this.mantenimientoRepository.remove(mantenimiento);
  }

  async getHistorialActivo(activoId: number): Promise<Mantenimiento[]> {
    return this.mantenimientoRepository.find({
      where: { activoId },
      relations: ['tecnico', 'tecnico.role'],
      order: { fechaProgramada: 'DESC' },
    });
  }

  async getMantenimientosProximos(dias: number = 7): Promise<Mantenimiento[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    return this.mantenimientoRepository.find({
      where: {
        fechaProgramada: LessThanOrEqual(fechaLimite),
        estado: EstadoMantenimiento.PROGRAMADO,
      },
      relations: ['activo', 'tecnico'],
      order: { fechaProgramada: 'ASC' },
    });
  }
}

