import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientosProgramadosService } from './mantenimientos-programados.service';
import { MantenimientosProgramadosController } from './mantenimientos-programados.controller';
import { MantenimientoProgramado } from './entities/mantenimiento-programado.entity';
import { Activo } from '../activos/entities/activo.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { MantenimientosModule } from '../mantenimientos/mantenimientos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MantenimientoProgramado, Activo]),
    NotificacionesModule,
    forwardRef(() => MantenimientosModule),
  ],
  controllers: [MantenimientosProgramadosController],
  providers: [MantenimientosProgramadosService],
  exports: [MantenimientosProgramadosService],
})
export class MantenimientosProgramadosModule {}

