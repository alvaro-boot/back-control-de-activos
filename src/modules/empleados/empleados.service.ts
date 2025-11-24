import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
  ) {}

  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    if (createEmpleadoDto.correo) {
      const existingEmpleado = await this.empleadoRepository.findOne({
        where: { correo: createEmpleadoDto.correo },
      });

      if (existingEmpleado) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    const empleado = this.empleadoRepository.create(createEmpleadoDto);
    return this.empleadoRepository.save(empleado);
  }

  async findAll(empresaId?: number): Promise<Empleado[]> {
    const where = empresaId ? { empresaId } : {};
    return this.empleadoRepository.find({
      where,
      relations: [
        'empresa',
        'area',
        'area.sede',
        'area.sede.empresa',
        'asignaciones',
      ],
    });
  }

  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id },
      relations: [
        'empresa',
        'area',
        'area.sede',
        'area.sede.empresa',
        'asignaciones',
        'asignaciones.activo',
        'asignaciones.activo.categoria',
        'asignaciones.activo.sede',
        'asignaciones.entregadoPor',
        'asignaciones.recibidoPor',
      ],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto): Promise<Empleado> {
    const empleado = await this.findOne(id);

    if (
      updateEmpleadoDto.correo &&
      updateEmpleadoDto.correo !== empleado.correo
    ) {
      const existingEmpleado = await this.empleadoRepository.findOne({
        where: { correo: updateEmpleadoDto.correo },
      });
      if (existingEmpleado) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    Object.assign(empleado, updateEmpleadoDto);
    return this.empleadoRepository.save(empleado);
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);
    await this.empleadoRepository.remove(empleado);
  }
}

