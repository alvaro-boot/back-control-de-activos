import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Activo } from '../../activos/entities/activo.entity';

@Entity('depreciacion_activos')
export class DepreciacionActivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ type: 'int' })
  anio: number;

  @Column({ name: 'valor_depreciado', type: 'decimal', precision: 12, scale: 2 })
  valorDepreciado: number;

  @Column({ name: 'valor_restante', type: 'decimal', precision: 12, scale: 2 })
  valorRestante: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo, (activo) => activo.depreciaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;
}

