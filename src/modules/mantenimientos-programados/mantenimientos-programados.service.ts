import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import {
  MantenimientoProgramado,
  EstadoMantenimientoProgramado,
} from './entities/mantenimiento-programado.entity';
import { CreateMantenimientoProgramadoDto } from './dto/create-mantenimiento-programado.dto';
import { UpdateMantenimientoProgramadoDto } from './dto/update-mantenimiento-programado.dto';
import { CreateMantenimientoMasivoDto } from './dto/create-mantenimiento-masivo.dto';
import { CompletarMantenimientoProgramadoDto } from './dto/completar-mantenimiento-programado.dto';
import { Activo } from '../activos/entities/activo.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { TipoNotificacion } from '../notificaciones/entities/notificacion.entity';
import { MantenimientosService } from '../mantenimientos/mantenimientos.service';
import { TipoMantenimiento } from '../mantenimientos/entities/mantenimiento.entity';

@Injectable()
export class MantenimientosProgramadosService {
  constructor(
    @InjectRepository(MantenimientoProgramado)
    private mantenimientoProgramadoRepository: Repository<MantenimientoProgramado>,
    @InjectRepository(Activo)
    private activoRepository: Repository<Activo>,
    private notificacionesService: NotificacionesService,
    private mantenimientosService: MantenimientosService,
  ) {}

  async create(
    createDto: CreateMantenimientoProgramadoDto,
  ): Promise<MantenimientoProgramado> {
    const mantenimiento = this.mantenimientoProgramadoRepository.create({
      ...createDto,
      fechaProgramada: new Date(createDto.fechaProgramada),
      estado:
        createDto.estado || EstadoMantenimientoProgramado.PENDIENTE,
      descripcion: createDto.descripcion,
      tareas: createDto.tareas && createDto.tareas.length > 0 ? createDto.tareas : null,
    });

    return this.mantenimientoProgramadoRepository.save(mantenimiento);
  }

  async findAll(
    activoId?: number,
    tecnicoId?: number,
    empresaId?: number,
  ): Promise<MantenimientoProgramado[]> {
    try {
      const queryBuilder = this.mantenimientoProgramadoRepository
        .createQueryBuilder('mantenimientoProgramado')
        .leftJoinAndSelect('mantenimientoProgramado.activo', 'activo')
        .leftJoinAndSelect('activo.categoria', 'categoria')
        .leftJoinAndSelect('activo.sede', 'sede')
        .leftJoinAndSelect('activo.area', 'area')
        .leftJoinAndSelect('mantenimientoProgramado.tecnico', 'tecnico');

      if (activoId) {
        queryBuilder.andWhere('mantenimientoProgramado.activoId = :activoId', {
          activoId,
        });
      }

      if (tecnicoId) {
        queryBuilder.andWhere('mantenimientoProgramado.tecnicoId = :tecnicoId', {
          tecnicoId,
        });
      }

      if (empresaId) {
        queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
      }

      queryBuilder.orderBy('mantenimientoProgramado.fechaProgramada', 'ASC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error en findAll mantenimientos programados:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<MantenimientoProgramado> {
    try {
      const mantenimiento = await this.mantenimientoProgramadoRepository.findOne({
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
        throw new NotFoundException(
          `Mantenimiento programado con ID ${id} no encontrado`,
        );
      }

      return mantenimiento;
    } catch (error) {
      console.error(`Error en findOne mantenimiento programado ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: number,
    updateDto: UpdateMantenimientoProgramadoDto,
  ): Promise<MantenimientoProgramado> {
    const mantenimiento = await this.findOne(id);
    const tecnicoAnteriorId = mantenimiento.tecnicoId;

    if (updateDto.fechaProgramada) {
      mantenimiento.fechaProgramada = new Date(updateDto.fechaProgramada);
    }

    if (updateDto.estado) {
      mantenimiento.estado = updateDto.estado;
    }

    if (updateDto.tecnicoId !== undefined) {
      mantenimiento.tecnicoId = updateDto.tecnicoId;
    }

    const savedMantenimiento = await this.mantenimientoProgramadoRepository.save(mantenimiento);

    // Notificar al técnico si se asigna un mantenimiento
    if (updateDto.tecnicoId !== undefined && updateDto.tecnicoId && updateDto.tecnicoId !== tecnicoAnteriorId) {
      try {
        const mantenimientoCompleto = await this.findOne(id);
        await this.notificacionesService.create(
          updateDto.tecnicoId,
          TipoNotificacion.MANTENIMIENTO,
          'Mantenimiento Asignado',
          `Se te ha asignado un mantenimiento programado para ${mantenimientoCompleto.activo?.nombre || 'activo'} el ${new Date(mantenimientoCompleto.fechaProgramada).toLocaleDateString()}`,
          `/mantenimientos-programados/${mantenimientoCompleto.id}`,
          mantenimientoCompleto.id,
        );
      } catch (error) {
        console.error('Error al crear notificación:', error);
      }
    }

    return savedMantenimiento;
  }

  async remove(id: number): Promise<void> {
    const mantenimiento = await this.findOne(id);
    await this.mantenimientoProgramadoRepository.remove(mantenimiento);
  }

  async getProximos(
    dias: number = 7,
    empresaId?: number,
  ): Promise<MantenimientoProgramado[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const queryBuilder = this.mantenimientoProgramadoRepository
      .createQueryBuilder('mantenimientoProgramado')
      .leftJoinAndSelect('mantenimientoProgramado.activo', 'activo')
      .leftJoinAndSelect('activo.categoria', 'categoria')
      .leftJoinAndSelect('activo.sede', 'sede')
      .leftJoinAndSelect('activo.area', 'area')
      .leftJoinAndSelect('mantenimientoProgramado.tecnico', 'tecnico')
      .leftJoinAndSelect('tecnico.rol', 'tecnicoRol')
      .leftJoinAndSelect('tecnico.empresa', 'tecnicoEmpresa')
      .where('mantenimientoProgramado.fechaProgramada <= :fechaLimite', {
        fechaLimite,
      })
      .andWhere('mantenimientoProgramado.estado = :estado', {
        estado: EstadoMantenimientoProgramado.PENDIENTE,
      });

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    queryBuilder.orderBy('mantenimientoProgramado.fechaProgramada', 'ASC');

    return queryBuilder.getMany();
  }

  async createMasivo(
    createDto: CreateMantenimientoMasivoDto,
  ): Promise<{ creados: number; mantenimientos: MantenimientoProgramado[] }> {
    // Construir query para obtener activos según los filtros
    const where: any = {};

    if (createDto.empresaId) {
      where.empresaId = createDto.empresaId;
    }

    if (createDto.sedeId) {
      where.sedeId = createDto.sedeId;
    }

    if (createDto.categoriaId) {
      where.categoriaId = createDto.categoriaId;
    }

    // Obtener activos que cumplan los criterios
    const activos = await this.activoRepository.find({
      where,
    });

    if (activos.length === 0) {
      throw new BadRequestException(
        'No se encontraron activos con los criterios especificados',
      );
    }

    // Verificar que no existan mantenimientos programados pendientes para estos activos en la misma fecha
    const activosIds = activos.map((a) => a.id);
    const fechaProgramada = new Date(createDto.fechaProgramada);

    const mantenimientosExistentes = await this.mantenimientoProgramadoRepository.find({
      where: {
        activoId: In(activosIds),
        fechaProgramada: fechaProgramada,
        estado: EstadoMantenimientoProgramado.PENDIENTE,
      },
    });

    const activosConMantenimiento = new Set(
      mantenimientosExistentes.map((m) => m.activoId),
    );
    const activosSinMantenimiento = activos.filter(
      (a) => !activosConMantenimiento.has(a.id),
    );

    if (activosSinMantenimiento.length === 0) {
      throw new BadRequestException(
        'Todos los activos seleccionados ya tienen un mantenimiento programado para esta fecha',
      );
    }

    // Crear mantenimientos programados para cada activo
    const mantenimientos = activosSinMantenimiento.map((activo) =>
      this.mantenimientoProgramadoRepository.create({
        activoId: activo.id,
        tecnicoId: createDto.tecnicoId,
        fechaProgramada: fechaProgramada,
        estado: createDto.estado || EstadoMantenimientoProgramado.PENDIENTE,
        descripcion: createDto.descripcion,
        tareas: createDto.tareas && createDto.tareas.length > 0 ? createDto.tareas : null,
      }),
    );

    const mantenimientosGuardados = await this.mantenimientoProgramadoRepository.save(
      mantenimientos,
    );

    return {
      creados: mantenimientosGuardados.length,
      mantenimientos: mantenimientosGuardados,
    };
  }

  async completar(
    id: number,
    completarDto: CompletarMantenimientoProgramadoDto,
    tecnicoId: number,
  ): Promise<{ mantenimientoProgramado: MantenimientoProgramado; mantenimiento: any }> {
    const mantenimientoProgramado = await this.findOne(id);

    // Verificar que el mantenimiento esté pendiente
    if (mantenimientoProgramado.estado !== EstadoMantenimientoProgramado.PENDIENTE) {
      throw new BadRequestException(
        'Este mantenimiento programado ya fue completado o cancelado',
      );
    }

    // Verificar que el técnico esté asignado (si hay técnico asignado)
    if (mantenimientoProgramado.tecnicoId && mantenimientoProgramado.tecnicoId !== tecnicoId) {
      throw new BadRequestException(
        'No tienes permiso para completar este mantenimiento programado',
      );
    }

    // Marcar el mantenimiento programado como realizado
    mantenimientoProgramado.estado = EstadoMantenimientoProgramado.REALIZADO;
    await this.mantenimientoProgramadoRepository.save(mantenimientoProgramado);

    // Crear un registro de mantenimiento con los detalles proporcionados
    const mantenimiento = await this.mantenimientosService.create({
      activoId: mantenimientoProgramado.activoId,
      tecnicoId: tecnicoId,
      tipo: TipoMantenimiento.PREVENTIVO, // Los mantenimientos programados son preventivos
      fechaMantenimiento: new Date().toISOString().split('T')[0],
      notas: completarDto.notas || mantenimientoProgramado.descripcion || 'Mantenimiento programado completado',
      repuestosUtilizados: completarDto.repuestosUtilizados,
      tiempoIntervencion: completarDto.tiempoIntervencion,
    });

    // Actualizar el informe técnico si se proporcionó
    if (completarDto.informeTecnico) {
      await this.mantenimientosService.update(mantenimiento.id, {
        informeTecnico: completarDto.informeTecnico,
      });
      // Recargar el mantenimiento actualizado
      return {
        mantenimientoProgramado,
        mantenimiento: await this.mantenimientosService.findOne(mantenimiento.id),
      };
    }

    return {
      mantenimientoProgramado,
      mantenimiento,
    };
  }
}

