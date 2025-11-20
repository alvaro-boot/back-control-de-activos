import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivosProveedoresService } from './activos-proveedores.service';
import { ActivosProveedoresController } from './activos-proveedores.controller';
import { ActivoProveedor } from './entities/activo-proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivoProveedor])],
  controllers: [ActivosProveedoresController],
  providers: [ActivosProveedoresService],
  exports: [ActivosProveedoresService],
})
export class ActivosProveedoresModule {}

