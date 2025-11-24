import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activo } from '../activos/entities/activo.entity';
import { DepreciacionActivo } from '../depreciacion-activos/entities/depreciacion-activo.entity';
import { Mantenimiento } from '../mantenimientos/entities/mantenimiento.entity';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Activo)
    private activoRepository: Repository<Activo>,
    @InjectRepository(DepreciacionActivo)
    private depreciacionRepository: Repository<DepreciacionActivo>,
    @InjectRepository(Mantenimiento)
    private mantenimientoRepository: Repository<Mantenimiento>,
    @InjectRepository(Asignacion)
    private asignacionRepository: Repository<Asignacion>,
  ) {}

  async getDepreciacionMensual(empresaId?: number, mes?: number, anio?: number): Promise<any> {
    const fecha = mes && anio ? new Date(anio, mes - 1, 1) : new Date();
    const mesActual = fecha.getMonth() + 1;
    const anioActual = fecha.getFullYear();

    const queryBuilder = this.activoRepository
      .createQueryBuilder('activo')
      .select('activo.id', 'id')
      .addSelect('activo.codigo', 'codigo')
      .addSelect('activo.nombre', 'nombre')
      .addSelect('activo.valorCompra', 'valorCompra')
      .addSelect('activo.valorActual', 'valorActual')
      .addSelect('activo.fechaCompra', 'fechaCompra')
      .where('activo.valorCompra IS NOT NULL')
      .andWhere('activo.valorActual IS NOT NULL');

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    const activos = await queryBuilder.getRawMany();

    const depreciacionMensual = activos.map((activo: any) => {
      const valorDepreciado = (activo.valorCompra - activo.valorActual) || 0;
      const mesesTranscurridos = this.calcularMesesTranscurridos(
        new Date(activo.fechaCompra),
        new Date(anioActual, mesActual - 1, 1),
      );
      const depreciacionPorMes = mesesTranscurridos > 0 
        ? valorDepreciado / mesesTranscurridos 
        : 0;

      return {
        ...activo,
        depreciacionTotal: valorDepreciado,
        depreciacionMensual: depreciacionPorMes,
        mesesTranscurridos,
      };
    });

    const totalDepreciacion = depreciacionMensual.reduce(
      (sum, a) => sum + a.depreciacionMensual,
      0,
    );

    return {
      mes: mesActual,
      anio: anioActual,
      totalDepreciacion,
      activos: depreciacionMensual,
    };
  }

  async getComparativoContableFiscal(empresaId?: number): Promise<any> {
    // Simplificado: comparar valor contable vs fiscal
    const queryBuilder = this.activoRepository
      .createQueryBuilder('activo')
      .select('activo.id', 'id')
      .addSelect('activo.codigo', 'codigo')
      .addSelect('activo.nombre', 'nombre')
      .addSelect('activo.valorCompra', 'valorContable')
      .addSelect('activo.valorActual', 'valorActual')
      .where('activo.valorCompra IS NOT NULL');

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    const activos = await queryBuilder.getRawMany();

    const comparativo = activos.map((activo: any) => {
      const depreciacionContable = (activo.valorContable - activo.valorActual) || 0;
      // Para fiscal, usar método simplificado (lineal)
      const depreciacionFiscal = depreciacionContable; // En producción, calcular según método fiscal

      return {
        ...activo,
        depreciacionContable,
        depreciacionFiscal,
        diferencia: Math.abs(depreciacionContable - depreciacionFiscal),
      };
    });

    return {
      totalActivos: comparativo.length,
      totalDepreciacionContable: comparativo.reduce((sum, a) => sum + a.depreciacionContable, 0),
      totalDepreciacionFiscal: comparativo.reduce((sum, a) => sum + a.depreciacionFiscal, 0),
      activos: comparativo.sort((a, b) => b.diferencia - a.diferencia).slice(0, 20), // Top 20 diferencias
    };
  }

  async getActivosPorCentroCosto(empresaId?: number): Promise<any> {
    const queryBuilder = this.activoRepository
      .createQueryBuilder('activo')
      .leftJoin('activo.area', 'area')
      .select('area.id', 'areaId')
      .addSelect('area.nombre', 'areaNombre')
      .addSelect('COUNT(activo.id)', 'totalActivos')
      .addSelect('SUM(activo.valorActual)', 'valorTotal')
      .where('activo.areaId IS NOT NULL')
      .groupBy('area.id')
      .orderBy('totalActivos', 'DESC');

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    return queryBuilder.getRawMany();
  }

  async getActivosPorResponsable(empresaId?: number): Promise<any> {
    const queryBuilder = this.activoRepository
      .createQueryBuilder('activo')
      .leftJoin('activo.responsable', 'responsable')
      .select('responsable.id', 'responsableId')
      .addSelect('responsable.nombre', 'responsableNombre')
      .addSelect('COUNT(activo.id)', 'totalActivos')
      .addSelect('SUM(activo.valorActual)', 'valorTotal')
      .where('activo.responsableId IS NOT NULL')
      .groupBy('responsable.id')
      .orderBy('totalActivos', 'DESC');

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    return queryBuilder.getRawMany();
  }

  async getActivosPorEstado(empresaId?: number): Promise<any> {
    const queryBuilder = this.activoRepository
      .createQueryBuilder('activo')
      .select('activo.estado', 'estado')
      .addSelect('COUNT(activo.id)', 'total')
      .addSelect('SUM(activo.valorActual)', 'valorTotal')
      .groupBy('activo.estado');

    if (empresaId) {
      queryBuilder.andWhere('activo.empresaId = :empresaId', { empresaId });
    }

    return queryBuilder.getRawMany();
  }

  async getInventarioFisicoVsContable(empresaId?: number): Promise<any> {
    // Obtener todos los activos
    const activos = await this.activoRepository.find({
      where: empresaId ? { empresaId } : {},
    });

    // Obtener asignaciones activas
    const asignacionesActivas = await this.asignacionRepository.find({
      where: { fechaDevolucion: null },
      relations: ['activo'],
    });

    const activosAsignados = asignacionesActivas.map(a => a.activoId);
    const activosSinAsignar = activos.filter(a => !activosAsignados.includes(a.id));

    return {
      totalActivos: activos.length,
      activosAsignados: activosAsignados.length,
      activosSinAsignar: activosSinAsignar.length,
      activosSinAsignarLista: activosSinAsignar.map(a => ({
        id: a.id,
        codigo: a.codigo,
        nombre: a.nombre,
        estado: a.estado,
      })),
    };
  }

  private calcularMesesTranscurridos(fechaInicio: Date, fechaFin: Date): number {
    const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (fechaFin.getMonth() - fechaInicio.getMonth());
    return Math.max(1, meses);
  }
}

