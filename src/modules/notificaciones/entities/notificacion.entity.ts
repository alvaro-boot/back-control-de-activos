import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoNotificacion {
  SOLICITUD = 'solicitud',
  MANTENIMIENTO = 'mantenimiento',
  ASIGNACION = 'asignacion',
  ALERTA = 'alerta',
  SISTEMA = 'sistema',
}

export enum EstadoNotificacion {
  NO_LEIDA = 'no_leida',
  LEIDA = 'leida',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({
    type: 'enum',
    enum: TipoNotificacion,
  })
  tipo: TipoNotificacion;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({
    type: 'enum',
    enum: EstadoNotificacion,
    default: EstadoNotificacion.NO_LEIDA,
  })
  estado: EstadoNotificacion;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  @Column({ type: 'int', nullable: true })
  referenciaId: number; // ID de la entidad relacionada (solicitud, mantenimiento, etc.)

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}

