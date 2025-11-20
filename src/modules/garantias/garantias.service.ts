import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Garantia } from './entities/garantia.entity';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';

@Injectable()
export class GarantiasService {
  constructor(
    @InjectRepository(Garantia)
    private garantiaRepository: Repository<Garantia>,
  ) {}

  async create(createGarantiaDto: CreateGarantiaDto): Promise<Garantia> {
    // Verificar que no existe garantía para este activo
    const existing = await this.garantiaRepository.findOne({
      where: { activoId: createGarantiaDto.activoId },
    });

    if (existing) {
      throw new BadRequestException('Este activo ya tiene una garantía registrada');
    }

    const garantia = this.garantiaRepository.create({
      ...createGarantiaDto,
      fechaInicio: createGarantiaDto.fechaInicio
        ? new Date(createGarantiaDto.fechaInicio)
        : null,
      fechaFin: createGarantiaDto.fechaFin
        ? new Date(createGarantiaDto.fechaFin)
        : null,
    });

    return this.garantiaRepository.save(garantia);
  }

  async findAll(): Promise<Garantia[]> {
    return this.garantiaRepository.find({
      relations: ['activo', 'activo.empresa'],
    });
  }

  async findOne(id: number): Promise<Garantia> {
    const garantia = await this.garantiaRepository.findOne({
      where: { id },
      relations: ['activo', 'activo.empresa'],
    });

    if (!garantia) {
      throw new NotFoundException(`Garantía con ID ${id} no encontrada`);
    }

    return garantia;
  }

  async findByActivoId(activoId: number): Promise<Garantia> {
    const garantia = await this.garantiaRepository.findOne({
      where: { activoId },
      relations: ['activo'],
    });

    if (!garantia) {
      throw new NotFoundException(`Garantía para activo ${activoId} no encontrada`);
    }

    return garantia;
  }

  async update(id: number, updateGarantiaDto: UpdateGarantiaDto): Promise<Garantia> {
    const garantia = await this.findOne(id);

    if (updateGarantiaDto.fechaInicio) {
      garantia.fechaInicio = new Date(updateGarantiaDto.fechaInicio);
    }

    if (updateGarantiaDto.fechaFin) {
      garantia.fechaFin = new Date(updateGarantiaDto.fechaFin);
    }

    Object.assign(garantia, {
      ...updateGarantiaDto,
      fechaInicio: updateGarantiaDto.fechaInicio
        ? new Date(updateGarantiaDto.fechaInicio)
        : garantia.fechaInicio,
      fechaFin: updateGarantiaDto.fechaFin
        ? new Date(updateGarantiaDto.fechaFin)
        : garantia.fechaFin,
    });

    return this.garantiaRepository.save(garantia);
  }

  async remove(id: number): Promise<void> {
    const garantia = await this.findOne(id);
    await this.garantiaRepository.remove(garantia);
  }
}

