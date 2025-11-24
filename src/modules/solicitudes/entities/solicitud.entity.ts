import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Activo } from '../../activos/entities/activo.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';

export enum TipoSolicitud {
  TRASLADO = 'traslado',
  BAJA = 'baja',
  REPUESTO = 'repuesto',
  MANTENIMIENTO = 'mantenimiento',
}

export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  COMPLETADA = 'completada',
}

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TipoSolicitud,
  })
  tipo: TipoSolicitud;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado: EstadoSolicitud;

  @Column({ name: 'activo_id', nullable: true })
  activoId: number;

  @Column({ name: 'solicitante_id' })
  solicitanteId: number;

  @Column({ name: 'aprobado_por_id', nullable: true })
  aprobadoPorId: number;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'fecha_solicitud', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;

  @Column({ name: 'fecha_aprobacion', type: 'datetime', nullable: true })
  fechaAprobacion: Date;

  // Campos específicos para traslado
  @Column({ name: 'sede_origen_id', nullable: true })
  sedeOrigenId: number;

  @Column({ name: 'sede_destino_id', nullable: true })
  sedeDestinoId: number;

  @Column({ name: 'area_origen_id', nullable: true })
  areaOrigenId: number;

  @Column({ name: 'area_destino_id', nullable: true })
  areaDestinoId: number;

  // Campos específicos para repuestos
  @Column({ type: 'varchar', length: 200, nullable: true })
  repuestoNombre: string;

  @Column({ type: 'int', nullable: true })
  repuestoCantidad: number;

  @Column({ type: 'text', nullable: true })
  repuestoDescripcion: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo, { nullable: true })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'solicitante_id' })
  solicitante: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobado_por_id' })
  aprobadoPor: Usuario;
}

