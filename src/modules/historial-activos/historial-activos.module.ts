import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialActivosService } from './historial-activos.service';
import { HistorialActivosController } from './historial-activos.controller';
import { HistorialActivo } from './entities/historial-activo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialActivo])],
  controllers: [HistorialActivosController],
  providers: [HistorialActivosService],
  exports: [HistorialActivosService],
})
export class HistorialActivosModule {}

