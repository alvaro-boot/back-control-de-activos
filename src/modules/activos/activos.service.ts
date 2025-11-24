import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activo, EstadoActivo } from './entities/activo.entity';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
import { ActivosQrService } from '../activos-qr/activos-qr.service';
import { HistorialActivosService } from '../historial-activos/historial-activos.service';

@Injectable()
export class ActivosService {
  constructor(
    @InjectRepository(Activo)
    private activoRepository: Repository<Activo>,
    private activosQrService: ActivosQrService,
    private historialActivosService: HistorialActivosService,
  ) {}

  async create(
    createActivoDto: CreateActivoDto,
    usuarioId: number,
  ): Promise<Activo> {
    // Verificar que el código no exista
    const existingActivo = await this.activoRepository.findOne({
      where: { codigo: createActivoDto.codigo },
    });

    if (existingActivo) {
      throw new BadRequestException(
        `El código ${createActivoDto.codigo} ya está en uso`,
      );
    }

    const activo = this.activoRepository.create({
      ...createActivoDto,
      fechaCompra: createActivoDto.fechaCompra
        ? new Date(createActivoDto.fechaCompra)
        : null,
      estado: createActivoDto.estado || EstadoActivo.ACTIVO,
    });

    const savedActivo = await this.activoRepository.save(activo);

    // Generar QR
    try {
      await this.activosQrService.generateQR(savedActivo.id);
    } catch (error) {
      console.error('Error al generar QR:', error);
    }

    // Registrar en historial
    try {
      await this.historialActivosService.create({
        activoId: savedActivo.id,
        usuarioId,
        accion: 'Creación de activo',
        descripcion: `Activo creado con código ${savedActivo.codigo}`,
        estadoNuevo: savedActivo.estado,
      });
    } catch (error) {
      console.error('Error al registrar historial:', error);
    }

    return this.findOne(savedActivo.id);
  }

  async findAll(empresaId?: number): Promise<Activo[]> {
    try {
      const where = empresaId ? { empresaId } : {};
      return await this.activoRepository.find({
        where,
        relations: [
          'empresa',
          'categoria',
          'sede',
          'area',
          'responsable',
          'qr',
        ],
        order: { creadoEn: 'DESC' },
      });
    } catch (error) {
      console.error('Error en findAll activos:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<Activo> {
    try {
      const activo = await this.activoRepository.findOne({
        where: { id },
        relations: [
          'empresa',
          'categoria',
          'sede',
          'area',
          'responsable',
          'responsable.empresa',
          'responsable.area',
          'qr',
          'historiales',
          'historiales.usuario',
          'mantenimientos',
          'mantenimientos.tecnico',
          'mantenimientosProgramados',
          'mantenimientosProgramados.tecnico',
          'garantias',
        ],
      });

      if (!activo) {
        throw new NotFoundException(`Activo con ID ${id} no encontrado`);
      }

      return activo;
    } catch (error) {
      console.error('Error en findOne activo:', error);
      throw error;
    }
  }

  async update(
    id: number,
    updateActivoDto: UpdateActivoDto,
    usuarioId: number,
  ): Promise<Activo> {
    const activo = await this.findOne(id);

    // Verificar código único si se está cambiando
    if (updateActivoDto.codigo && updateActivoDto.codigo !== activo.codigo) {
      const existingActivo = await this.activoRepository.findOne({
        where: { codigo: updateActivoDto.codigo },
      });
      if (existingActivo) {
        throw new BadRequestException(
          `El código ${updateActivoDto.codigo} ya está en uso`,
        );
      }
    }

    // Guardar valores anteriores para historial
    const estadoAnterior = activo.estado;
    const responsableAnteriorId = activo.responsableId;
    const areaAnteriorId = activo.areaId;

    // Actualizar campos
    if (updateActivoDto.fechaCompra) {
      updateActivoDto.fechaCompra = new Date(
        updateActivoDto.fechaCompra,
      ) as any;
    }

    Object.assign(activo, updateActivoDto);

    const updatedActivo = await this.activoRepository.save(activo);

    // Registrar cambios en historial
    const cambios: string[] = [];
    if (estadoAnterior !== updatedActivo.estado) {
      cambios.push(`Estado: ${estadoAnterior} → ${updatedActivo.estado}`);
    }
    if (responsableAnteriorId !== updatedActivo.responsableId) {
      cambios.push('Cambio de responsable');
    }
    if (areaAnteriorId !== updatedActivo.areaId) {
      cambios.push('Cambio de área');
    }

    if (cambios.length > 0) {
      try {
        await this.historialActivosService.create({
          activoId: updatedActivo.id,
          usuarioId,
          accion: 'Actualización de activo',
          descripcion: cambios.join(', '),
          responsableAnteriorId,
          responsableNuevoId: updatedActivo.responsableId,
          areaAnteriorId,
          areaNuevaId: updatedActivo.areaId,
          estadoAnterior,
          estadoNuevo: updatedActivo.estado,
        });
      } catch (error) {
        console.error('Error al registrar historial:', error);
      }
    }

    return this.findOne(updatedActivo.id);
  }

  async remove(id: number): Promise<void> {
    const activo = await this.findOne(id);
    await this.activoRepository.remove(activo);
  }

  async regenerateQR(activoId: number): Promise<Activo> {
    await this.activosQrService.regenerateQR(activoId);
    return this.findOne(activoId);
  }

  // Método para empleados: solo pueden ver activos asignados a ellos
  async findOneForEmpleado(id: number, usuarioId: number): Promise<Activo> {
    const activo = await this.activoRepository.findOne({
      where: { id },
      relations: [
        'empresa',
        'categoria',
        'sede',
        'area',
        'responsable',
        'qr',
        'mantenimientosProgramados',
        'garantias',
        'asignaciones',
        'asignaciones.empleado',
      ],
    });

    if (!activo) {
      throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    }

    // Buscar empleado por correo del usuario (asumiendo que el correo coincide)
    const usuario = await this.activoRepository.manager
      .getRepository('usuarios')
      .findOne({
        where: { id: usuarioId },
        select: ['id', 'correo', 'areaId'],
      });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Buscar empleado con el mismo correo
    const empleado = await this.activoRepository.manager
      .getRepository('empleados')
      .findOne({
        where: { correo: (usuario as any).correo },
        select: ['id', 'correo'],
      });

    // Verificar que el activo esté asignado al empleado o sea responsable
    if (empleado) {
      const asignacionActiva = activo.asignaciones?.find(
        (a) => a.empleadoId === (empleado as any).id && !a.fechaDevolucion,
      );

      if (!asignacionActiva && activo.responsableId !== (empleado as any).id) {
        throw new NotFoundException('No tienes acceso a este activo');
      }
    } else {
      // Si no hay empleado asociado, verificar por área del usuario
      if ((usuario as any).areaId && activo.areaId !== (usuario as any).areaId) {
        throw new NotFoundException('No tienes acceso a este activo');
      }
    }

    // Ocultar datos financieros para empleados
    const activoSinFinanciero = { ...activo };
    delete (activoSinFinanciero as any).valorCompra;
    delete (activoSinFinanciero as any).valorActual;
    delete (activoSinFinanciero as any).depreciaciones;

    return activoSinFinanciero as Activo;
  }

  // Método para técnicos: solo pueden cambiar el estado operativo
  async updateEstadoTecnico(
    id: number,
    updateActivoDto: UpdateActivoDto,
    usuarioId: number,
  ): Promise<Activo> {
    const activo = await this.findOne(id);

    // Solo permitir cambios de estado operativo
    const estadosPermitidos = ['activo', 'mantenimiento', 'retirado'];
    if (updateActivoDto.estado && !estadosPermitidos.includes(updateActivoDto.estado)) {
      throw new BadRequestException('Estado no permitido para técnicos');
    }

    // Solo actualizar el estado, ignorar otros campos
    const estadoAnterior = activo.estado;
    if (updateActivoDto.estado) {
      activo.estado = updateActivoDto.estado as EstadoActivo;
    }

    const updatedActivo = await this.activoRepository.save(activo);

    // Registrar en historial
    if (estadoAnterior !== updatedActivo.estado) {
      try {
        await this.historialActivosService.create({
          activoId: updatedActivo.id,
          usuarioId,
          accion: 'Cambio de estado técnico',
          descripcion: `Estado cambiado por técnico: ${estadoAnterior} → ${updatedActivo.estado}`,
          estadoAnterior,
          estadoNuevo: updatedActivo.estado,
        });
      } catch (error) {
        console.error('Error al registrar historial:', error);
      }
    }

    return this.findOne(updatedActivo.id);
  }
}
