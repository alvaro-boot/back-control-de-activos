import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientosProgramadosService } from './mantenimientos-programados.service';
import { MantenimientosProgramadosController } from './mantenimientos-programados.controller';
import { MantenimientoProgramado } from './entities/mantenimiento-programado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MantenimientoProgramado])],
  controllers: [MantenimientosProgramadosController],
  providers: [MantenimientosProgramadosService],
  exports: [MantenimientosProgramadosService],
})
export class MantenimientosProgramadosModule {}

