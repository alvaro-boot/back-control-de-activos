import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MantenimientosService } from '../mantenimientos.service';

@Injectable()
export class MantenimientosTask {
  private readonly logger = new Logger(MantenimientosTask.name);

  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleMantenimientosProximos() {
    this.logger.log('Revisando mantenimientos próximos...');
    
    try {
      const mantenimientos = await this.mantenimientosService.getMantenimientosProximos(7);
      
      if (mantenimientos.length > 0) {
        this.logger.log(
          `Se encontraron ${mantenimientos.length} mantenimientos programados para los próximos 7 días`,
        );
        // Aquí podrías enviar notificaciones por email, etc.
      } else {
        this.logger.log('No hay mantenimientos programados para los próximos 7 días');
      }
    } catch (error) {
      this.logger.error('Error al revisar mantenimientos próximos', error);
    }
  }
}

