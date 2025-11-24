import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { getDatabaseConfig } from './config/database.config';
import envConfig from './config/env.config';
import { AppController } from './app.controller';

// Módulos
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { SedesModule } from './modules/sedes/sedes.module';
import { AreasModule } from './modules/areas/areas.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ActivosModule } from './modules/activos/activos.module';
import { ActivosQrModule } from './modules/activos-qr/activos-qr.module';
import { HistorialActivosModule } from './modules/historial-activos/historial-activos.module';
import { MantenimientosModule } from './modules/mantenimientos/mantenimientos.module';
import { MantenimientosProgramadosModule } from './modules/mantenimientos-programados/mantenimientos-programados.module';
import { GarantiasModule } from './modules/garantias/garantias.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { ActivosProveedoresModule } from './modules/activos-proveedores/activos-proveedores.module';
import { DepreciacionActivosModule } from './modules/depreciacion-activos/depreciacion-activos.module';
import { AsignacionesModule } from './modules/asignaciones/asignaciones.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { AdminSistemaModule } from './modules/admin-sistema/admin-sistema.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { InventarioFisicoModule } from './modules/inventario-fisico/inventario-fisico.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { EmailModule } from './common/services/email.module';

@Module({
  controllers: [AppController],
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),

    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Tareas programadas
    ScheduleModule.forRoot(),

    // Servir archivos estáticos (QR images)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Módulos globales
    EmailModule,

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    RolesModule,
    EmpresasModule,
    SedesModule,
    AreasModule,
    CategoriasModule,
    ActivosModule,
    ActivosQrModule,
    HistorialActivosModule,
    MantenimientosModule,
    MantenimientosProgramadosModule,
    GarantiasModule,
    ProveedoresModule,
    ActivosProveedoresModule,
    DepreciacionActivosModule,
    AsignacionesModule,
    EmpleadosModule,
    AdminSistemaModule,
    SolicitudesModule,
    NotificacionesModule,
    InventarioFisicoModule,
    ReportesModule,
  ],
})
export class AppModule {}

