import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { getDatabaseConfig } from './config/database.config';
import envConfig from './config/env.config';

// Módulos
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { AreasModule } from './modules/areas/areas.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { ActivosModule } from './modules/activos/activos.module';
import { AsignacionesModule } from './modules/asignaciones/asignaciones.module';
import { MantenimientosModule } from './modules/mantenimientos/mantenimientos.module';

@Module({
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

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    RolesModule,
    EmpresasModule,
    AreasModule,
    EmpleadosModule,
    ActivosModule,
    AsignacionesModule,
    MantenimientosModule,
  ],
})
export class AppModule {}

