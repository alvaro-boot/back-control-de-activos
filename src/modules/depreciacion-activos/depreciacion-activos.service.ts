import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepreciacionActivo } from './entities/depreciacion-activo.entity';
import { CreateDepreciacionActivoDto } from './dto/create-depreciacion-activo.dto';
import { UpdateDepreciacionActivoDto } from './dto/update-depreciacion-activo.dto';

@Injectable()
export class DepreciacionActivosService {
  constructor(
    @InjectRepository(DepreciacionActivo)
    private depreciacionRepository: Repository<DepreciacionActivo>,
  ) {}

  async create(
    createDto: CreateDepreciacionActivoDto,
  ): Promise<DepreciacionActivo> {
    const depreciacion = this.depreciacionRepository.create(createDto);
    return this.depreciacionRepository.save(depreciacion);
  }

  async findAll(activoId?: number): Promise<DepreciacionActivo[]> {
    const where = activoId ? { activoId } : {};
    return this.depreciacionRepository.find({
      where,
      relations: ['activo'],
      order: { anio: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DepreciacionActivo> {
    const depreciacion = await this.depreciacionRepository.findOne({
      where: { id },
      relations: ['activo'],
    });

    if (!depreciacion) {
      throw new NotFoundException(
        `Depreciación con ID ${id} no encontrada`,
      );
    }

    return depreciacion;
  }

  async update(
    id: number,
    updateDto: UpdateDepreciacionActivoDto,
  ): Promise<DepreciacionActivo> {
    const depreciacion = await this.findOne(id);
    Object.assign(depreciacion, updateDto);
    return this.depreciacionRepository.save(depreciacion);
  }

  async remove(id: number): Promise<void> {
    const depreciacion = await this.findOne(id);
    await this.depreciacionRepository.remove(depreciacion);
  }

  async getByActivoAndAnio(
    activoId: number,
    anio: number,
  ): Promise<DepreciacionActivo | null> {
    return this.depreciacionRepository.findOne({
      where: { activoId, anio },
      relations: ['activo'],
    });
  }
}

