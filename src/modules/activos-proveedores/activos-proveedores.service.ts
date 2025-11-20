import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivoProveedor } from './entities/activo-proveedor.entity';
import { CreateActivoProveedorDto } from './dto/create-activo-proveedor.dto';
import { UpdateActivoProveedorDto } from './dto/update-activo-proveedor.dto';

@Injectable()
export class ActivosProveedoresService {
  constructor(
    @InjectRepository(ActivoProveedor)
    private activoProveedorRepository: Repository<ActivoProveedor>,
  ) {}

  async create(createDto: CreateActivoProveedorDto): Promise<ActivoProveedor> {
    const activoProveedor = this.activoProveedorRepository.create(createDto);
    return this.activoProveedorRepository.save(activoProveedor);
  }

  async findAll(activoId?: number, proveedorId?: number): Promise<ActivoProveedor[]> {
    const where: any = {};
    if (activoId) where.activoId = activoId;
    if (proveedorId) where.proveedorId = proveedorId;

    return this.activoProveedorRepository.find({
      where,
      relations: ['activo', 'proveedor'],
    });
  }

  async findOne(id: number): Promise<ActivoProveedor> {
    const activoProveedor = await this.activoProveedorRepository.findOne({
      where: { id },
      relations: ['activo', 'proveedor'],
    });

    if (!activoProveedor) {
      throw new NotFoundException(
        `Relación activo-proveedor con ID ${id} no encontrada`,
      );
    }

    return activoProveedor;
  }

  async update(
    id: number,
    updateDto: UpdateActivoProveedorDto,
  ): Promise<ActivoProveedor> {
    const activoProveedor = await this.findOne(id);
    Object.assign(activoProveedor, updateDto);
    return this.activoProveedorRepository.save(activoProveedor);
  }

  async remove(id: number): Promise<void> {
    const activoProveedor = await this.findOne(id);
    await this.activoProveedorRepository.remove(activoProveedor);
  }
}

