import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const existingEmpresa = await this.empresaRepository.findOne({
      where: { nit: createEmpresaDto.nit },
    });

    if (existingEmpresa) {
      throw new BadRequestException('El NIT ya está registrado');
    }

    const empresa = this.empresaRepository.create(createEmpresaDto);
    return this.empresaRepository.save(empresa);
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaRepository.find();
  }

  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
      relations: ['usuarios', 'areas', 'empleados', 'activos'],
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return empresa;
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.findOne(id);

    if (updateEmpresaDto.nit && updateEmpresaDto.nit !== empresa.nit) {
      const existingEmpresa = await this.empresaRepository.findOne({
        where: { nit: updateEmpresaDto.nit },
      });
      if (existingEmpresa) {
        throw new BadRequestException('El NIT ya está registrado');
      }
    }

    Object.assign(empresa, updateEmpresaDto);
    return this.empresaRepository.save(empresa);
  }

  async remove(id: number): Promise<void> {
    const empresa = await this.findOne(id);
    await this.empresaRepository.remove(empresa);
  }
}

