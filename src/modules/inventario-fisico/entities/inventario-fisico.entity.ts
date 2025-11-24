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

@Entity('inventario_fisico')
export class InventarioFisico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'fecha_inventario', type: 'date' })
  fechaInventario: Date;

  @Column({ type: 'boolean', default: false })
  confirmado: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'ubicacion_verificada', type: 'varchar', length: 200, nullable: true })
  ubicacionVerificada: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Activo)
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}

