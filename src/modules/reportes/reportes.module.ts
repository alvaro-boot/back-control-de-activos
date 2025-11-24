import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Activo } from '../activos/entities/activo.entity';
import { DepreciacionActivo } from '../depreciacion-activos/entities/depreciacion-activo.entity';
import { Mantenimiento } from '../mantenimientos/entities/mantenimiento.entity';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activo,
      DepreciacionActivo,
      Mantenimiento,
      Asignacion,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}

