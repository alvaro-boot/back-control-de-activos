import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientosService } from './mantenimientos.service';
import { MantenimientosController } from './mantenimientos.controller';
import { Mantenimiento } from './entities/mantenimiento.entity';
import { MantenimientosTask } from './tasks/mantenimientos.task';
import { MantenimientosProgramadosModule } from '../mantenimientos-programados/mantenimientos-programados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mantenimiento]),
    MantenimientosProgramadosModule,
  ],
  controllers: [MantenimientosController],
  providers: [MantenimientosService, MantenimientosTask],
  exports: [MantenimientosService],
})
export class MantenimientosModule {}

