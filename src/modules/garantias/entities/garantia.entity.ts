import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Activo } from '../../activos/entities/activo.entity';

@Entity('garantias')
export class Garantia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id', unique: true })
  activoId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  proveedor: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date;

  @Column({ name: 'numero_contrato', type: 'varchar', length: 100, nullable: true })
  numeroContrato: string;

  @Column({ name: 'correo_contacto', type: 'varchar', length: 150, nullable: true })
  correoContacto: string;

  @Column({ name: 'telefono_contacto', type: 'varchar', length: 20, nullable: true })
  telefonoContacto: string;

  @OneToOne(() => Activo, (activo) => activo.garantias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;
}

