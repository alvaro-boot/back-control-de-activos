import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Area } from '../../areas/entities/area.entity';
import { Asignacion } from '../../asignaciones/entities/asignacion.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'area_id' })
  areaId: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cargo: string;

  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.empleados)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Area, (area) => area.empleados)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @OneToMany(() => Asignacion, (asignacion) => asignacion.empleado)
  asignaciones: Asignacion[];
}

