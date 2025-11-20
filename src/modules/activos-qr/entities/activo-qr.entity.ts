import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Activo } from '../../activos/entities/activo.entity';

@Entity('activos_qr')
export class ActivoQr {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id', unique: true })
  activoId: number;

  @Column({ name: 'contenido_qr', type: 'text' })
  contenidoQr: string;

  @Column({ name: 'url_imagen_qr', type: 'text', nullable: true })
  urlImagenQr: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo, (activo) => activo.qr, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;
}

