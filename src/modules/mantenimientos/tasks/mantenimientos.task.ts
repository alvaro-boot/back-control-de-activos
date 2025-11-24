import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MantenimientosProgramadosService } from '../../mantenimientos-programados/mantenimientos-programados.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { TipoNotificacion } from '../../notificaciones/entities/notificacion.entity';

@Injectable()
export class MantenimientosTask {
  private readonly logger = new Logger(MantenimientosTask.name);

  constructor(
    private readonly mantenimientosProgramadosService: MantenimientosProgramadosService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleMantenimientosProximos() {
    this.logger.log('Revisando mantenimientos programados próximos...');
    
    try {
      const mantenimientos = await this.mantenimientosProgramadosService.getProximos(7);
      
      if (mantenimientos.length > 0) {
        this.logger.log(
          `Se encontraron ${mantenimientos.length} mantenimientos programados para los próximos 7 días`,
        );
        
        // Crear notificaciones para técnicos y administradores
        for (const mantenimiento of mantenimientos) {
          if (mantenimiento.tecnicoId) {
            try {
              await this.notificacionesService.create(
                mantenimiento.tecnicoId,
                TipoNotificacion.MANTENIMIENTO,
                'Mantenimiento Próximo',
                `Tienes un mantenimiento programado para ${mantenimiento.activo?.nombre || 'activo'} el ${new Date(mantenimiento.fechaProgramada).toLocaleDateString()}`,
                `/mantenimientos-programados/${mantenimiento.id}`,
                mantenimiento.id,
              );
            } catch (error) {
              this.logger.error(`Error al crear notificación para técnico ${mantenimiento.tecnicoId}`, error);
            }
          }
        }
      } else {
        this.logger.log('No hay mantenimientos programados para los próximos 7 días');
      }
    } catch (error) {
      this.logger.error('Error al revisar mantenimientos próximos', error);
    }
  }
}

