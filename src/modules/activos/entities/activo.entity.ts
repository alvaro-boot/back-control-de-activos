import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { Area } from '../../areas/entities/area.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';
import { ActivoQr } from '../../activos-qr/entities/activo-qr.entity';
import { HistorialActivo } from '../../historial-activos/entities/historial-activo.entity';
import { Mantenimiento } from '../../mantenimientos/entities/mantenimiento.entity';
import { MantenimientoProgramado } from '../../mantenimientos-programados/entities/mantenimiento-programado.entity';
import { Garantia } from '../../garantias/entities/garantia.entity';
import { ActivoProveedor } from '../../activos-proveedores/entities/activo-proveedor.entity';
import { DepreciacionActivo } from '../../depreciacion-activos/entities/depreciacion-activo.entity';
import { Asignacion } from '../../asignaciones/entities/asignacion.entity';

export enum EstadoActivo {
  ACTIVO = 'activo',
  MANTENIMIENTO = 'mantenimiento',
  RETIRADO = 'retirado',
  PERDIDO = 'perdido',
}

@Entity('activos')
export class Activo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'categoria_id', nullable: true })
  categoriaId: number;

  @Column({ name: 'sede_id', nullable: true })
  sedeId: number;

  @Column({ name: 'area_id', nullable: true })
  areaId: number;

  @Column({ name: 'responsable_id', nullable: true })
  responsableId: number;

  @Column({ name: 'fecha_compra', type: 'date', nullable: true })
  fechaCompra: Date;

  @Column({ name: 'valor_compra', type: 'decimal', precision: 12, scale: 2, nullable: true })
  valorCompra: number;

  @Column({ name: 'valor_actual', type: 'decimal', precision: 12, scale: 2, nullable: true })
  valorActual: number;

  @Column({
    type: 'enum',
    enum: EstadoActivo,
    default: EstadoActivo.ACTIVO,
  })
  estado: EstadoActivo;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.activos)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Categoria, (categoria) => categoria.activos, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @ManyToOne(() => Sede, (sede) => sede.activos, { nullable: true })
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;

  @ManyToOne(() => Area, (area) => area.activos, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Empleado;

  @OneToMany(() => ActivoQr, (qr) => qr.activo)
  qr: ActivoQr[];

  @OneToMany(() => HistorialActivo, (historial) => historial.activo)
  historiales: HistorialActivo[];

  @OneToMany(() => Mantenimiento, (mantenimiento) => mantenimiento.activo)
  mantenimientos: Mantenimiento[];

  @OneToMany(() => MantenimientoProgramado, (mp) => mp.activo)
  mantenimientosProgramados: MantenimientoProgramado[];

  @OneToMany(() => Garantia, (garantia) => garantia.activo)
  garantias: Garantia[];

  @OneToMany(() => ActivoProveedor, (ap) => ap.activo)
  proveedores: ActivoProveedor[];

  @OneToMany(() => DepreciacionActivo, (dep) => dep.activo)
  depreciaciones: DepreciacionActivo[];

  @OneToMany(() => Asignacion, (asignacion) => asignacion.activo)
  asignaciones: Asignacion[];
}
