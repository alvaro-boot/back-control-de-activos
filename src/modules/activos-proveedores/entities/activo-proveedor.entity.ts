import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Activo } from '../../activos/entities/activo.entity';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';

@Entity('activos_proveedores')
export class ActivoProveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'proveedor_id' })
  proveedorId: number;

  @Column({ name: 'numero_factura', type: 'varchar', length: 120, nullable: true })
  numeroFactura: string;

  @ManyToOne(() => Activo, (activo) => activo.proveedores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.activos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;
}

