import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSistemaService } from './admin-sistema.service';
import { AdminSistemaController } from './admin-sistema.controller';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Activo } from '../activos/entities/activo.entity';
import { MantenimientoProgramado } from '../mantenimientos-programados/entities/mantenimiento-programado.entity';
import { ActivoQr } from '../activos-qr/entities/activo-qr.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { EmpresasModule } from '../empresas/empresas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empresa,
      Usuario,
      Activo,
      MantenimientoProgramado,
      ActivoQr,
    ]),
    UsuariosModule,
    EmpresasModule,
  ],
  controllers: [AdminSistemaController],
  providers: [AdminSistemaService],
  exports: [AdminSistemaService],
})
export class AdminSistemaModule {}

