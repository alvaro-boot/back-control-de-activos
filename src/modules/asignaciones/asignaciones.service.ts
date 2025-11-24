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

  async findAll(
    activoId?: number,
    empleadoId?: number,
    empresaId?: number,
  ): Promise<Asignacion[]> {
    const queryBuilder = this.asignacionRepository
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.activo', 'activo')
      .leftJoinAndSelect('activo.categoria', 'categoria')
      .leftJoinAndSelect('activo.sede', 'sede')
      .leftJoinAndSelect('activo.area', 'area')
      .leftJoinAndSelect('asignacion.empleado', 'empleado')
      .leftJoinAndSelect('empleado.area', 'empleadoArea')
      .leftJoinAndSelect('empleadoArea.sede', 'empleadoSede')
      .leftJoinAndSelect('empleado.empresa', 'empleadoEmpresa')
      .leftJoinAndSelect('asignacion.entregadoPor', 'entregadoPor')
      .leftJoinAndSelect('entregadoPor.rol', 'entregadoPorRol')
      .leftJoinAndSelect('asignacion.recibidoPor', 'recibidoPor')
      .leftJoinAndSelect('recibidoPor.rol', 'recibidoPorRol');

    if (activoId) {
      queryBuilder.andWhere('asignacion.activoId = :activoId', { activoId });
    }

    if (empleadoId) {
      queryBuilder.andWhere('asignacion.empleadoId = :empleadoId', { empleadoId });
    }

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    queryBuilder.orderBy('asignacion.fechaAsignacion', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Asignacion> {
    try {
      const asignacion = await this.asignacionRepository.findOne({
        where: { id },
        relations: [
          'activo',
          'activo.categoria',
          'activo.sede',
          'activo.area',
          'activo.responsable',
          'activo.responsable.empresa',
          'activo.responsable.area',
          'empleado',
          'empleado.area',
          'empleado.empresa',
          'entregadoPor',
          'entregadoPor.rol',
          'entregadoPor.empresa',
          'recibidoPor',
          'recibidoPor.rol',
          'recibidoPor.empresa',
        ],
      });

      if (!asignacion) {
        throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
      }

      return asignacion;
    } catch (error) {
      console.error('Error en findOne asignacion:', error);
      throw error;
    }
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
    try {
      return await this.asignacionRepository.find({
        where: { activoId },
        relations: [
          'activo',
          'empleado',
          'empleado.area',
          'empleado.empresa',
          'entregadoPor',
          'entregadoPor.rol',
          'recibidoPor',
          'recibidoPor.rol',
        ],
        order: { fechaAsignacion: 'DESC' },
      });
    } catch (error) {
      console.error('Error en getHistorialActivo:', error);
      throw error;
    }
  }

  async getHistorialEmpleado(empleadoId: number): Promise<Asignacion[]> {
    try {
      return await this.asignacionRepository.find({
        where: { empleadoId },
        relations: [
          'activo',
          'activo.categoria',
          'activo.sede',
          'activo.area',
          'empleado',
          'empleado.area',
          'empleado.empresa',
          'entregadoPor',
          'entregadoPor.rol',
          'recibidoPor',
          'recibidoPor.rol',
        ],
        order: { fechaAsignacion: 'DESC' },
      });
    } catch (error) {
      console.error('Error en getHistorialEmpleado:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const asignacion = await this.findOne(id);
    await this.asignacionRepository.remove(asignacion);
  }
}

