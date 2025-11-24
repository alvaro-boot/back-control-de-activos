import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Activo } from '../activos/entities/activo.entity';
import { MantenimientoProgramado, EstadoMantenimientoProgramado } from '../mantenimientos-programados/entities/mantenimiento-programado.entity';
import { ActivoQr } from '../activos-qr/entities/activo-qr.entity';

@Injectable()
export class AdminSistemaService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Activo)
    private activoRepository: Repository<Activo>,
    @InjectRepository(MantenimientoProgramado)
    private mantenimientoProgramadoRepository: Repository<MantenimientoProgramado>,
    @InjectRepository(ActivoQr)
    private activoQrRepository: Repository<ActivoQr>,
  ) {}

  async getDashboardStats() {
    const [
      totalEmpresas,
      empresasActivas,
      totalUsuarios,
      totalActivos,
      mantenimientosProximos,
      activosSinQR,
    ] = await Promise.all([
      this.empresaRepository.count(),
      this.empresaRepository.count({ where: {} }), // Por ahora todas están activas
      this.usuarioRepository.count({ where: { activo: 1 } }),
      this.activoRepository.count(),
      this.mantenimientoProgramadoRepository.count({
        where: { estado: EstadoMantenimientoProgramado.PENDIENTE },
      }),
      this.getActivosSinQR(),
    ]);

    // Empresas con más activos
    const empresasConActivos = await this.activoRepository
      .createQueryBuilder('activo')
      .select('empresa.id', 'empresaId')
      .addSelect('empresa.nombre', 'nombre')
      .addSelect('COUNT(activo.id)', 'totalActivos')
      .innerJoin('activo.empresa', 'empresa')
      .groupBy('empresa.id')
      .orderBy('totalActivos', 'DESC')
      .limit(10)
      .getRawMany();

    // Empresas con más mantenimientos pendientes
    const empresasConMantenimientos = await this.mantenimientoProgramadoRepository
      .createQueryBuilder('mp')
      .select('empresa.id', 'empresaId')
      .addSelect('empresa.nombre', 'nombre')
      .addSelect('COUNT(mp.id)', 'totalMantenimientos')
      .innerJoin('mp.activo', 'activo')
      .innerJoin('activo.empresa', 'empresa')
      .where('mp.estado = :estado', { estado: EstadoMantenimientoProgramado.PENDIENTE })
      .groupBy('empresa.id')
      .orderBy('totalMantenimientos', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      indicadores: {
        totalEmpresas,
        empresasActivas,
        empresasInactivas: totalEmpresas - empresasActivas,
        totalUsuarios,
        totalActivos,
        mantenimientosProximos,
        activosSinQR,
      },
      graficas: {
        empresasConMasActivos: empresasConActivos,
        empresasConMasMantenimientos: empresasConMantenimientos,
      },
    };
  }

  private async getActivosSinQR(): Promise<number> {
    const activosConQR = await this.activoQrRepository
      .createQueryBuilder('qr')
      .select('qr.activoId')
      .getRawMany();

    const idsConQR = activosConQR.map((q) => q.qr_activo_id);
    const totalActivos = await this.activoRepository.count();

    return totalActivos - idsConQR.length;
  }

  async getEmpresaDetallada(id: number) {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
      relations: [
        'usuarios',
        'usuarios.rol',
        'sedes',
        'activos',
        'activos.categoria',
        'activos.responsable',
        'empleados',
        'categorias',
      ],
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const totalUsuarios = empresa.usuarios?.length || 0;
    const totalActivos = empresa.activos?.length || 0;
    const totalSedes = empresa.sedes?.length || 0;
    const totalEmpleados = empresa.empleados?.length || 0;

    const mantenimientosProximos = await this.mantenimientoProgramadoRepository
      .createQueryBuilder('mp')
      .innerJoin('mp.activo', 'activo')
      .where('activo.empresaId = :empresaId', { empresaId: id })
      .andWhere('mp.estado = :estado', { estado: 'pendiente' })
      .getCount();

    return {
      ...empresa,
      estadisticas: {
        totalUsuarios,
        totalActivos,
        totalSedes,
        totalEmpleados,
        mantenimientosProximos,
      },
    };
  }

  async toggleEmpresaActiva(id: number, activa: boolean) {
    // Por ahora todas las empresas están activas
    // En el futuro se puede agregar un campo 'activa' a la entidad Empresa
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return empresa;
  }
}

