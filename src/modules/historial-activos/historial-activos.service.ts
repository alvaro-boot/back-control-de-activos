import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialActivo } from './entities/historial-activo.entity';
import { CreateHistorialActivoDto } from './dto/create-historial-activo.dto';

@Injectable()
export class HistorialActivosService {
  constructor(
    @InjectRepository(HistorialActivo)
    private historialRepository: Repository<HistorialActivo>,
  ) {}

  async create(createHistorialDto: CreateHistorialActivoDto): Promise<HistorialActivo> {
    const historial = this.historialRepository.create(createHistorialDto);
    return this.historialRepository.save(historial);
  }

  async findByActivoId(activoId: number): Promise<HistorialActivo[]> {
    return this.historialRepository.find({
      where: { activoId },
      relations: [
        'usuario',
        'usuario.rol',
        'responsableAnterior',
        'responsableNuevo',
        'areaAnterior',
        'areaNueva',
      ],
      order: { creadoEn: 'DESC' },
    });
  }

  async findAll(): Promise<HistorialActivo[]> {
    return this.historialRepository.find({
      relations: [
        'activo',
        'usuario',
        'usuario.rol',
        'responsableAnterior',
        'responsableNuevo',
        'areaAnterior',
        'areaNueva',
      ],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: number): Promise<HistorialActivo> {
    return this.historialRepository.findOne({
      where: { id },
      relations: [
        'activo',
        'usuario',
        'usuario.rol',
        'responsableAnterior',
        'responsableNuevo',
        'areaAnterior',
        'areaNueva',
      ],
    });
  }
}

