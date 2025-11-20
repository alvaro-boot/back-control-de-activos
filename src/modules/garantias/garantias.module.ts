import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarantiasService } from './garantias.service';
import { GarantiasController } from './garantias.controller';
import { Garantia } from './entities/garantia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Garantia])],
  controllers: [GarantiasController],
  providers: [GarantiasService],
  exports: [GarantiasService],
})
export class GarantiasModule {}

