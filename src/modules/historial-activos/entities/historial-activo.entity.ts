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
import { Area } from '../../areas/entities/area.entity';

@Entity('historial_activos')
export class HistorialActivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 100 })
  accion: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'responsable_anterior', nullable: true })
  responsableAnteriorId: number;

  @Column({ name: 'responsable_nuevo', nullable: true })
  responsableNuevoId: number;

  @Column({ name: 'area_anterior', nullable: true })
  areaAnteriorId: number;

  @Column({ name: 'area_nueva', nullable: true })
  areaNuevaId: number;

  @Column({ name: 'estado_anterior', type: 'varchar', length: 50, nullable: true })
  estadoAnterior: string;

  @Column({ name: 'estado_nuevo', type: 'varchar', length: 50, nullable: true })
  estadoNuevo: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo, (activo) => activo.historiales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Usuario, (usuario) => usuario.historiales)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.historialesResponsableAnterior, { nullable: true })
  @JoinColumn({ name: 'responsable_anterior' })
  responsableAnterior: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.historialesResponsableNuevo, { nullable: true })
  @JoinColumn({ name: 'responsable_nuevo' })
  responsableNuevo: Usuario;

  @ManyToOne(() => Area, (area) => area.historialesAreaAnterior, { nullable: true })
  @JoinColumn({ name: 'area_anterior' })
  areaAnterior: Area;

  @ManyToOne(() => Area, (area) => area.historialesAreaNueva, { nullable: true })
  @JoinColumn({ name: 'area_nueva' })
  areaNueva: Area;
}

