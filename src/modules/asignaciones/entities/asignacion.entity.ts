import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Activo } from '../../activos/entities/activo.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('asignaciones')
export class Asignacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'empleado_id' })
  empleadoId: number;

  @Column({ name: 'entregado_por' })
  entregadoPorId: number;

  @Column({ name: 'recibido_por', nullable: true })
  recibidoPorId: number;

  @Column({ name: 'fecha_asignacion', type: 'datetime' })
  fechaAsignacion: Date;

  @Column({ name: 'fecha_devolucion', type: 'datetime', nullable: true })
  fechaDevolucion: Date;

  @ManyToOne(() => Activo, (activo) => activo.asignaciones)
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Empleado, (empleado) => empleado.asignaciones)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @ManyToOne(() => Usuario, (usuario) => usuario.asignacionesEntregadas)
  @JoinColumn({ name: 'entregado_por' })
  entregadoPor: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.asignacionesRecibidas, {
    nullable: true,
  })
  @JoinColumn({ name: 'recibido_por' })
  recibidoPor: Usuario;
}

