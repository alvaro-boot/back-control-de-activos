import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { DevolverAsignacionDto } from './dto/devolver-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Asignacion)
    private asignacionRepository: Repository<Asignacion>,
  ) {}

  async create(
    createAsignacionDto: CreateAsignacionDto,
    entregadoPorId: number,
  ): Promise<Asignacion> {
    // Verificar que el activo existe y no está asignado
    const asignacionActiva = await this.asignacionRepository.findOne({
      where: {
        activoId: createAsignacionDto.activoId,
        fechaDevolucion: null,
      },
      relations: ['activo', 'empleado'],
    });

    if (asignacionActiva) {
      throw new BadRequestException(
        `El activo ya está asignado al empleado ${asignacionActiva.empleado.nombre}. Debe cerrar la asignación anterior primero.`,
      );
    }

    const asignacion = this.asignacionRepository.create({
      ...createAsignacionDto,
      entregadoPorId,
      fechaAsignacion: createAsignacionDto.fechaAsignacion
        ? new Date(createAsignacionDto.fechaAsignacion)
        : new Date(),
    });

    return this.asignacionRepository.save(asignacion);
  }

  async findAll(activoId?: number, empleadoId?: number): Promise<Asignacion[]> {
    const where: any = {};
    if (activoId) where.activoId = activoId;
    if (empleadoId) where.empleadoId = empleadoId;

    return this.asignacionRepository.find({
      where,
      relations: [
        'activo',
        'empleado',
        'empleado.area',
        'entregadoPor',
        'recibidoPor',
      ],
      order: { fechaAsignacion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Asignacion> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
      relations: [
        'activo',
        'empleado',
        'empleado.area',
        'entregadoPor',
        'recibidoPor',
      ],
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    return asignacion;
  }

  async devolver(
    id: number,
    devolverAsignacionDto: DevolverAsignacionDto,
    recibidoPorId: number,
  ): Promise<Asignacion> {
    const asignacion = await this.findOne(id);

    if (asignacion.fechaDevolucion) {
      throw new BadRequestException('Esta asignación ya fue devuelta');
    }

    asignacion.fechaDevolucion = devolverAsignacionDto.fechaDevolucion
      ? new Date(devolverAsignacionDto.fechaDevolucion)
      : new Date();
    asignacion.recibidoPorId = recibidoPorId;

    return this.asignacionRepository.save(asignacion);
  }

  async getHistorialActivo(activoId: number): Promise<Asignacion[]> {
    return this.asignacionRepository.find({
      where: { activoId },
      relations: [
        'empleado',
        'empleado.area',
        'entregadoPor',
        'recibidoPor',
      ],
      order: { fechaAsignacion: 'DESC' },
    });
  }

  async getHistorialEmpleado(empleadoId: number): Promise<Asignacion[]> {
    return this.asignacionRepository.find({
      where: { empleadoId },
      relations: ['activo', 'entregadoPor', 'recibidoPor'],
      order: { fechaAsignacion: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const asignacion = await this.findOne(id);
    await this.asignacionRepository.remove(asignacion);
  }
}

