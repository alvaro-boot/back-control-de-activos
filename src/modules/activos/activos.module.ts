import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivosService } from './activos.service';
import { ActivosController } from './activos.controller';
import { QrController } from './qr.controller';
import { Activo } from './entities/activo.entity';
import { ActivosQrModule } from '../activos-qr/activos-qr.module';
import { HistorialActivosModule } from '../historial-activos/historial-activos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activo]),
    ActivosQrModule,
    HistorialActivosModule,
  ],
  controllers: [ActivosController, QrController],
  providers: [ActivosService],
  exports: [ActivosService],
})
export class ActivosModule {}

