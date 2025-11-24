import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioFisicoService } from './inventario-fisico.service';
import { InventarioFisicoController } from './inventario-fisico.controller';
import { InventarioFisico } from './entities/inventario-fisico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioFisico])],
  controllers: [InventarioFisicoController],
  providers: [InventarioFisicoService],
  exports: [InventarioFisicoService],
})
export class InventarioFisicoModule {}

