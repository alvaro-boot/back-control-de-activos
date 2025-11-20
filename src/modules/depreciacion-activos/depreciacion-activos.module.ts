import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepreciacionActivosService } from './depreciacion-activos.service';
import { DepreciacionActivosController } from './depreciacion-activos.controller';
import { DepreciacionActivo } from './entities/depreciacion-activo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepreciacionActivo])],
  controllers: [DepreciacionActivosController],
  providers: [DepreciacionActivosService],
  exports: [DepreciacionActivosService],
})
export class DepreciacionActivosModule {}

