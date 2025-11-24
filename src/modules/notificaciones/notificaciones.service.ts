import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, TipoNotificacion, EstadoNotificacion } from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
  ) {}

  async create(
    usuarioId: number,
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    url?: string,
    referenciaId?: number,
  ): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      usuarioId,
      tipo,
      titulo,
      mensaje,
      url,
      referenciaId,
      estado: EstadoNotificacion.NO_LEIDA,
    });

    return this.notificacionRepository.save(notificacion);
  }

  async findAll(usuarioId: number, noLeidas?: boolean): Promise<Notificacion[]> {
    const where: any = { usuarioId };
    if (noLeidas) {
      where.estado = EstadoNotificacion.NO_LEIDA;
    }

    return this.notificacionRepository.find({
      where,
      order: { creadoEn: 'DESC' },
      take: 50, // Últimas 50 notificaciones
    });
  }

  async marcarComoLeida(id: number, usuarioId: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id, usuarioId },
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    notificacion.estado = EstadoNotificacion.LEIDA;
    return this.notificacionRepository.save(notificacion);
  }

  async marcarTodasComoLeidas(usuarioId: number): Promise<void> {
    await this.notificacionRepository.update(
      { usuarioId, estado: EstadoNotificacion.NO_LEIDA },
      { estado: EstadoNotificacion.LEIDA },
    );
  }

  async contarNoLeidas(usuarioId: number): Promise<number> {
    return this.notificacionRepository.count({
      where: {
        usuarioId,
        estado: EstadoNotificacion.NO_LEIDA,
      },
    });
  }

  async eliminar(id: number, usuarioId: number): Promise<void> {
    await this.notificacionRepository.delete({ id, usuarioId });
  }
}

