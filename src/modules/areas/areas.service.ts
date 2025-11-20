import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
  ) {}

  async create(createAreaDto: CreateAreaDto): Promise<Area> {
    const area = this.areaRepository.create(createAreaDto);
    return this.areaRepository.save(area);
  }

  async findAll(sedeId?: number): Promise<Area[]> {
    const where = sedeId ? { sedeId } : {};
    return this.areaRepository.find({
      where,
      relations: ['sede', 'sede.empresa', 'usuarios', 'activos'],
    });
  }

  async findOne(id: number): Promise<Area> {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ['sede', 'sede.empresa', 'usuarios', 'activos'],
    });

    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }

    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);
    Object.assign(area, updateAreaDto);
    return this.areaRepository.save(area);
  }

  async remove(id: number): Promise<void> {
    const area = await this.findOne(id);
    await this.areaRepository.remove(area);
  }
}

