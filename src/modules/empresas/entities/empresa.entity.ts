import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Activo } from '../../activos/entities/activo.entity';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: true })
  nit: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.empresa)
  usuarios: Usuario[];

  @OneToMany(() => Sede, (sede) => sede.empresa)
  sedes: Sede[];

  @OneToMany(() => Categoria, (categoria) => categoria.empresa)
  categorias: Categoria[];

  @OneToMany(() => Activo, (activo) => activo.empresa)
  activos: Activo[];

  @OneToMany(() => Proveedor, (proveedor) => proveedor.empresa)
  proveedores: Proveedor[];

  @OneToMany(() => Empleado, (empleado) => empleado.empresa)
  empleados: Empleado[];
}
