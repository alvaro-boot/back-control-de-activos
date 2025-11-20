import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Sede } from '../../sedes/entities/sede.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Activo } from '../../activos/entities/activo.entity';
import { HistorialActivo } from '../../historial-activos/entities/historial-activo.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sede_id' })
  sedeId: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToOne(() => Sede, (sede) => sede.areas)
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;

  @OneToMany(() => Usuario, (usuario) => usuario.area)
  usuarios: Usuario[];

  @OneToMany(() => Activo, (activo) => activo.area)
  activos: Activo[];

  @OneToMany(() => HistorialActivo, (historial) => historial.areaAnterior)
  historialesAreaAnterior: HistorialActivo[];

  @OneToMany(() => HistorialActivo, (historial) => historial.areaNueva)
  historialesAreaNueva: HistorialActivo[];
}
