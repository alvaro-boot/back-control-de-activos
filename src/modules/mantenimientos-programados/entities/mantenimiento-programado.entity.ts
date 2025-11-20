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

export enum EstadoMantenimientoProgramado {
  PENDIENTE = 'pendiente',
  REALIZADO = 'realizado',
  CANCELADO = 'cancelado',
}

@Entity('mantenimientos_programados')
export class MantenimientoProgramado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'tecnico_id', nullable: true })
  tecnicoId: number;

  @Column({ name: 'fecha_programada', type: 'date' })
  fechaProgramada: Date;

  @Column({
    type: 'enum',
    enum: EstadoMantenimientoProgramado,
    default: EstadoMantenimientoProgramado.PENDIENTE,
  })
  estado: EstadoMantenimientoProgramado;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo, (activo) => activo.mantenimientosProgramados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Usuario, (usuario) => usuario.mantenimientosProgramados, { nullable: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: Usuario;
}

