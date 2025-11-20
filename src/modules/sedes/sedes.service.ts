import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './entities/sede.entity';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private sedeRepository: Repository<Sede>,
  ) {}

  async create(createSedeDto: CreateSedeDto): Promise<Sede> {
    const sede = this.sedeRepository.create(createSedeDto);
    return this.sedeRepository.save(sede);
  }

  async findAll(empresaId?: number): Promise<Sede[]> {
    const where = empresaId ? { empresaId } : {};
    return this.sedeRepository.find({
      where,
      relations: ['empresa', 'areas', 'activos'],
    });
  }

  async findOne(id: number): Promise<Sede> {
    const sede = await this.sedeRepository.findOne({
      where: { id },
      relations: ['empresa', 'areas', 'activos'],
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }

    return sede;
  }

  async update(id: number, updateSedeDto: UpdateSedeDto): Promise<Sede> {
    const sede = await this.findOne(id);
    Object.assign(sede, updateSedeDto);
    return this.sedeRepository.save(sede);
  }

  async remove(id: number): Promise<void> {
    const sede = await this.findOne(id);
    await this.sedeRepository.remove(sede);
  }
}

