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

export enum TipoMantenimiento {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
}

export enum EstadoMantenimiento {
  PENDIENTE = 'pendiente',
  INICIADO = 'iniciado',
  PAUSADO = 'pausado',
  FINALIZADO = 'finalizado',
}

@Entity('mantenimientos')
export class Mantenimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'tecnico_id' })
  tecnicoId: number;

  @Column({
    type: 'enum',
    enum: TipoMantenimiento,
  })
  tipo: TipoMantenimiento;

  @Column({
    type: 'enum',
    enum: EstadoMantenimiento,
    default: EstadoMantenimiento.PENDIENTE,
  })
  estado: EstadoMantenimiento;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'text', nullable: true })
  informeTecnico: string;

  @Column({ name: 'fecha_mantenimiento', type: 'date' })
  fechaMantenimiento: Date;

  @Column({ name: 'fecha_inicio', type: 'datetime', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_finalizacion', type: 'datetime', nullable: true })
  fechaFinalizacion: Date;

  @Column({ name: 'tiempo_intervencion', type: 'int', nullable: true })
  tiempoIntervencion: number; // en minutos

  @Column({ type: 'text', nullable: true })
  repuestosUtilizados: string; // JSON o texto con repuestos

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costo: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo, (activo) => activo.mantenimientos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Usuario, (usuario) => usuario.mantenimientos)
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: Usuario;
}
