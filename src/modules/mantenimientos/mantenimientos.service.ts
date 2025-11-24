import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mantenimiento, TipoMantenimiento, EstadoMantenimiento } from './entities/mantenimiento.entity';
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
      activoId: createMantenimientoDto.activoId,
      tecnicoId: createMantenimientoDto.tecnicoId!,
      tipo: createMantenimientoDto.tipo,
      notas: createMantenimientoDto.notas,
      fechaMantenimiento: new Date(createMantenimientoDto.fechaMantenimiento),
      estado: EstadoMantenimiento.FINALIZADO, // Los mantenimientos creados desde QR se marcan como finalizados
      fechaInicio: new Date(),
      fechaFinalizacion: new Date(),
      repuestosUtilizados: createMantenimientoDto.repuestosUtilizados,
      tiempoIntervencion: createMantenimientoDto.tiempoIntervencion,
      costo: createMantenimientoDto.costo,
    });

    return this.mantenimientoRepository.save(mantenimiento);
  }

  async findAll(
    activoId?: number,
    tecnicoId?: number,
    empresaId?: number,
  ): Promise<Mantenimiento[]> {
    try {
      const queryBuilder = this.mantenimientoRepository
        .createQueryBuilder('mantenimiento')
        .leftJoinAndSelect('mantenimiento.activo', 'activo')
        .leftJoinAndSelect('activo.categoria', 'categoria')
        .leftJoinAndSelect('activo.sede', 'sede')
        .leftJoinAndSelect('activo.area', 'area')
        .leftJoinAndSelect('mantenimiento.tecnico', 'tecnico');

      if (activoId) {
        queryBuilder.andWhere('mantenimiento.activoId = :activoId', { activoId });
      }

      if (tecnicoId) {
        queryBuilder.andWhere('mantenimiento.tecnicoId = :tecnicoId', { tecnicoId });
      }

      if (empresaId) {
        queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
      }

      queryBuilder.orderBy('mantenimiento.fechaMantenimiento', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error en findAll mantenimientos:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<Mantenimiento> {
    try {
      const mantenimiento = await this.mantenimientoRepository.findOne({
        where: { id },
        relations: [
          'activo',
          'activo.categoria',
          'activo.sede',
          'activo.area',
          'activo.responsable',
          'tecnico',
        ],
      });

      if (!mantenimiento) {
        throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
      }

      return mantenimiento;
    } catch (error) {
      console.error(`Error en findOne mantenimiento ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: number,
    updateMantenimientoDto: UpdateMantenimientoDto,
  ): Promise<Mantenimiento> {
    const mantenimiento = await this.findOne(id);

    if (updateMantenimientoDto.fechaMantenimiento) {
      mantenimiento.fechaMantenimiento = new Date(
        updateMantenimientoDto.fechaMantenimiento,
      );
    }

    if (updateMantenimientoDto.notas) {
      mantenimiento.notas = updateMantenimientoDto.notas;
    }

    if (updateMantenimientoDto.tipo) {
      mantenimiento.tipo = updateMantenimientoDto.tipo;
    }

    if (updateMantenimientoDto.costo !== undefined) {
      mantenimiento.costo = updateMantenimientoDto.costo;
    }

    if (updateMantenimientoDto.tecnicoId) {
      mantenimiento.tecnicoId = updateMantenimientoDto.tecnicoId;
    }

    if (updateMantenimientoDto.informeTecnico !== undefined) {
      mantenimiento.informeTecnico = updateMantenimientoDto.informeTecnico;
    }

    return this.mantenimientoRepository.save(mantenimiento);
  }

  async remove(id: number): Promise<void> {
    const mantenimiento = await this.findOne(id);
    await this.mantenimientoRepository.remove(mantenimiento);
  }

  async getHistorialActivo(activoId: number): Promise<Mantenimiento[]> {
    try {
      return await this.mantenimientoRepository.find({
        where: { activoId },
        relations: [
          'activo',
          'activo.categoria',
          'tecnico',
        ],
        order: { fechaMantenimiento: 'DESC' },
      });
    } catch (error) {
      console.error(`Error en getHistorialActivo ${activoId}:`, error);
      throw error;
    }
  }

  // Método para técnicos: solo pueden ver sus propios mantenimientos
  async findOneForTecnico(id: number, tecnicoId: number): Promise<Mantenimiento> {
    const mantenimiento = await this.findOne(id);
    
    if (mantenimiento.tecnicoId !== tecnicoId) {
      throw new NotFoundException('No tienes acceso a este mantenimiento');
    }
    
    return mantenimiento;
  }

  // Método para técnicos: solo pueden actualizar estado, notas, repuestos, tiempos
  async updateByTecnico(
    id: number,
    updateMantenimientoDto: UpdateMantenimientoDto,
    tecnicoId: number,
  ): Promise<Mantenimiento> {
    const mantenimiento = await this.findOne(id);
    
    // Verificar que el técnico es el asignado
    if (mantenimiento.tecnicoId !== tecnicoId) {
      throw new NotFoundException('No tienes permiso para actualizar este mantenimiento');
    }
    
    // Solo permitir actualizar campos específicos para técnicos
    if (updateMantenimientoDto.notas !== undefined) {
      mantenimiento.notas = updateMantenimientoDto.notas;
    }
    
    // No permitir cambiar tipo, costo, o técnico asignado
    // Los técnicos solo pueden ejecutar, no administrar
    
    return this.mantenimientoRepository.save(mantenimiento);
  }
}

