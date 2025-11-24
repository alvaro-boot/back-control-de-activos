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
import { Role } from '../../roles/entities/role.entity';
import { Area } from '../../areas/entities/area.entity';
import { Mantenimiento } from '../../mantenimientos/entities/mantenimiento.entity';
import { MantenimientoProgramado } from '../../mantenimientos-programados/entities/mantenimiento-programado.entity';
import { HistorialActivo } from '../../historial-activos/entities/historial-activo.entity';
import { Asignacion } from '../../asignaciones/entities/asignacion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'rol_id' })
  rolId: number;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 150 })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo: string;

  @Column({ type: 'text' })
  contrasena: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ name: 'area_id', nullable: true })
  areaId: number;

  @Column({ type: 'tinyint', default: 1 })
  activo: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.usuarios)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Role, (role) => role.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: Role;

  @ManyToOne(() => Area, (area) => area.usuarios, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  // Responsable de activos ahora es un empleado, no un usuario

  @OneToMany(() => Mantenimiento, (mantenimiento) => mantenimiento.tecnico)
  mantenimientos: Mantenimiento[];

  @OneToMany(() => MantenimientoProgramado, (mp) => mp.tecnico)
  mantenimientosProgramados: MantenimientoProgramado[];

  @OneToMany(() => HistorialActivo, (historial) => historial.usuario)
  historiales: HistorialActivo[];

  @OneToMany(() => HistorialActivo, (historial) => historial.responsableAnterior)
  historialesResponsableAnterior: HistorialActivo[];

  @OneToMany(() => HistorialActivo, (historial) => historial.responsableNuevo)
  historialesResponsableNuevo: HistorialActivo[];

  @OneToMany(() => Asignacion, (asignacion) => asignacion.entregadoPor)
  asignacionesEntregadas: Asignacion[];

  @OneToMany(() => Asignacion, (asignacion) => asignacion.recibidoPor)
  asignacionesRecibidas: Asignacion[];
}
