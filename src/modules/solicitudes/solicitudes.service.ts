import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud, EstadoSolicitud } from './entities/solicitud.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { TipoNotificacion } from '../notificaciones/entities/notificacion.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
    private notificacionesService: NotificacionesService,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudDto,
    solicitanteId: number,
  ): Promise<Solicitud> {
    const solicitud = this.solicitudRepository.create({
      ...createSolicitudDto,
      solicitanteId,
      estado: EstadoSolicitud.PENDIENTE,
      fechaSolicitud: new Date(),
    });

    const savedSolicitud = await this.solicitudRepository.save(solicitud);

    // Notificar a administradores (esto se puede mejorar buscando administradores de la empresa)
    // Por ahora, solo creamos la notificación para el solicitante
    try {
      await this.notificacionesService.create(
        solicitanteId,
        TipoNotificacion.SOLICITUD,
        'Solicitud Creada',
        `Tu solicitud de ${createSolicitudDto.tipo} ha sido creada y está pendiente de aprobación`,
        `/solicitudes/${savedSolicitud.id}`,
        savedSolicitud.id,
      );
    } catch (error) {
      console.error('Error al crear notificación:', error);
    }

    return savedSolicitud;
  }

  async findAll(empresaId?: number, estado?: EstadoSolicitud): Promise<Solicitud[]> {
    const queryBuilder = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.activo', 'activo')
      .leftJoinAndSelect('solicitud.solicitante', 'solicitante')
      .leftJoinAndSelect('solicitud.aprobadoPor', 'aprobadoPor')
      .leftJoinAndSelect('solicitante.empresa', 'empresa');

    if (empresaId) {
      queryBuilder.andWhere('empresa.id = :empresaId', { empresaId });
    }

    if (estado) {
      queryBuilder.andWhere('solicitud.estado = :estado', { estado });
    }

    queryBuilder.orderBy('solicitud.fechaSolicitud', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.activo', 'activo')
      .leftJoinAndSelect('activo.empresa', 'empresa')
      .leftJoinAndSelect('solicitud.solicitante', 'solicitante')
      .leftJoinAndSelect('solicitante.rol', 'solicitanteRol')
      .leftJoinAndSelect('solicitante.empresa', 'solicitanteEmpresa')
      .leftJoinAndSelect('solicitud.aprobadoPor', 'aprobadoPor')
      .where('solicitud.id = :id', { id })
      .getOne();

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  async aprobar(id: number, aprobadoPorId: number, observaciones?: string): Promise<Solicitud> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
      throw new BadRequestException('Solo se pueden aprobar solicitudes pendientes');
    }

    solicitud.estado = EstadoSolicitud.APROBADA;
    solicitud.aprobadoPorId = aprobadoPorId;
    solicitud.fechaAprobacion = new Date();
    if (observaciones) {
      solicitud.observaciones = observaciones;
    }

    const savedSolicitud = await this.solicitudRepository.save(solicitud);

    // Notificar al solicitante
    try {
      await this.notificacionesService.create(
        solicitud.solicitanteId,
        TipoNotificacion.SOLICITUD,
        'Solicitud Aprobada',
        `Tu solicitud de ${solicitud.tipo} ha sido aprobada`,
        `/solicitudes/${savedSolicitud.id}`,
        savedSolicitud.id,
      );
    } catch (error) {
      console.error('Error al crear notificación:', error);
    }

    return savedSolicitud;
  }

  async rechazar(id: number, aprobadoPorId: number, observaciones: string): Promise<Solicitud> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
      throw new BadRequestException('Solo se pueden rechazar solicitudes pendientes');
    }

    solicitud.estado = EstadoSolicitud.RECHAZADA;
    solicitud.aprobadoPorId = aprobadoPorId;
    solicitud.fechaAprobacion = new Date();
    solicitud.observaciones = observaciones;

    const savedSolicitud = await this.solicitudRepository.save(solicitud);

    // Notificar al solicitante
    try {
      await this.notificacionesService.create(
        solicitud.solicitanteId,
        TipoNotificacion.SOLICITUD,
        'Solicitud Rechazada',
        `Tu solicitud de ${solicitud.tipo} ha sido rechazada. Observaciones: ${observaciones}`,
        `/solicitudes/${savedSolicitud.id}`,
        savedSolicitud.id,
      );
    } catch (error) {
      console.error('Error al crear notificación:', error);
    }

    return savedSolicitud;
  }

  async completar(id: number): Promise<Solicitud> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== EstadoSolicitud.APROBADA) {
      throw new BadRequestException('Solo se pueden completar solicitudes aprobadas');
    }

    solicitud.estado = EstadoSolicitud.COMPLETADA;

    return this.solicitudRepository.save(solicitud);
  }

  async remove(id: number): Promise<void> {
    const solicitud = await this.findOne(id);
    await this.solicitudRepository.remove(solicitud);
  }
}

