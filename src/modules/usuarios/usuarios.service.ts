import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PasswordUtil } from '../../common/utils/password.util';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({
      where: { correo: createUsuarioDto.correo },
    });

    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async findAll(empresaId?: number): Promise<Usuario[]> {
    const where = empresaId ? { empresaId } : {};
    return this.usuarioRepository.find({
      where,
      relations: ['rol', 'empresa', 'area'],
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'empresa', 'area'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async findOneById(id: number): Promise<Usuario> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'empresa', 'area'],
    });
  }

  async findByEmail(correo: string): Promise<Usuario> {
    return this.usuarioRepository.findOne({
      where: { correo },
      relations: ['rol', 'empresa', 'area'],
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
      const existingUser = await this.findByEmail(updateUsuarioDto.correo);
      if (existingUser) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    if (updateUsuarioDto.contrasena) {
      updateUsuarioDto.contrasena = await PasswordUtil.hash(
        updateUsuarioDto.contrasena,
      );
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }
}

