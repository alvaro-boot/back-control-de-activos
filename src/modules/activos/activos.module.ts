import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivosService } from './activos.service';
import { ActivosController } from './activos.controller';
import { QrController } from './qr.controller';
import { Activo } from './entities/activo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activo])],
  controllers: [ActivosController, QrController],
  providers: [ActivosService],
  exports: [ActivosService],
})
export class ActivosModule {}

