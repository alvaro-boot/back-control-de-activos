import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivosQrService } from './activos-qr.service';
import { ActivoQr } from './entities/activo-qr.entity';
import { Activo } from '../activos/entities/activo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivoQr, Activo])],
  providers: [ActivosQrService],
  exports: [ActivosQrService],
})
export class ActivosQrModule {}

