import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  MantenimientoProgramado,
  EstadoMantenimientoProgramado,
} from './entities/mantenimiento-programado.entity';
import { CreateMantenimientoProgramadoDto } from './dto/create-mantenimiento-programado.dto';
import { UpdateMantenimientoProgramadoDto } from './dto/update-mantenimiento-programado.dto';

@Injectable()
export class MantenimientosProgramadosService {
  constructor(
    @InjectRepository(MantenimientoProgramado)
    private mantenimientoProgramadoRepository: Repository<MantenimientoProgramado>,
  ) {}

  async create(
    createDto: CreateMantenimientoProgramadoDto,
  ): Promise<MantenimientoProgramado> {
    const mantenimiento = this.mantenimientoProgramadoRepository.create({
      ...createDto,
      fechaProgramada: new Date(createDto.fechaProgramada),
      estado:
        createDto.estado || EstadoMantenimientoProgramado.PENDIENTE,
    });

    return this.mantenimientoProgramadoRepository.save(mantenimiento);
  }

  async findAll(
    activoId?: number,
    tecnicoId?: number,
  ): Promise<MantenimientoProgramado[]> {
    const where: any = {};
    if (activoId) where.activoId = activoId;
    if (tecnicoId) where.tecnicoId = tecnicoId;

    return this.mantenimientoProgramadoRepository.find({
      where,
      relations: ['activo', 'tecnico', 'tecnico.rol'],
      order: { fechaProgramada: 'ASC' },
    });
  }

  async findOne(id: number): Promise<MantenimientoProgramado> {
    const mantenimiento = await this.mantenimientoProgramadoRepository.findOne({
      where: { id },
      relations: ['activo', 'tecnico', 'tecnico.rol'],
    });

    if (!mantenimiento) {
      throw new NotFoundException(
        `Mantenimiento programado con ID ${id} no encontrado`,
      );
    }

    return mantenimiento;
  }

  async update(
    id: number,
    updateDto: UpdateMantenimientoProgramadoDto,
  ): Promise<MantenimientoProgramado> {
    const mantenimiento = await this.findOne(id);

    if (updateDto.fechaProgramada) {
      mantenimiento.fechaProgramada = new Date(updateDto.fechaProgramada);
    }

    if (updateDto.estado) {
      mantenimiento.estado = updateDto.estado;
    }

    if (updateDto.tecnicoId !== undefined) {
      mantenimiento.tecnicoId = updateDto.tecnicoId;
    }

    return this.mantenimientoProgramadoRepository.save(mantenimiento);
  }

  async remove(id: number): Promise<void> {
    const mantenimiento = await this.findOne(id);
    await this.mantenimientoProgramadoRepository.remove(mantenimiento);
  }

  async getProximos(dias: number = 7): Promise<MantenimientoProgramado[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    return this.mantenimientoProgramadoRepository.find({
      where: {
        fechaProgramada: LessThanOrEqual(fechaLimite),
        estado: EstadoMantenimientoProgramado.PENDIENTE,
      },
      relations: ['activo', 'tecnico'],
      order: { fechaProgramada: 'ASC' },
    });
  }
}

