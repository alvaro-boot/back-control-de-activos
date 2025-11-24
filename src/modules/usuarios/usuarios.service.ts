import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PasswordUtil } from '../../common/utils/password.util';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

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
      relations: ['rol', 'empresa', 'area', 'area.sede'],
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'empresa', 'area', 'area.sede', 'area.sede.empresa'],
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

  // Métodos para Super Admin
  async findAllGlobal(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['rol', 'empresa', 'area'],
      order: { creadoEn: 'DESC' },
    });
  }

  async resetPassword(id: number, newPassword: string): Promise<Usuario> {
    this.logger.debug(`Reseteando contraseña para usuario ID: ${id}`);
    
    const usuario = await this.findOne(id);
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    // Generar hash de la nueva contraseña
    const hashedPassword = await PasswordUtil.hash(newPassword);
    this.logger.debug(`Hash generado para usuario ID: ${id}`);
    
    // Actualizar directamente en la base de datos usando update para asegurar que se guarde
    const updateResult = await this.usuarioRepository.update(id, {
      contrasena: hashedPassword,
    });
    
    if (updateResult.affected === 0) {
      throw new BadRequestException('No se pudo actualizar la contraseña');
    }
    
    this.logger.debug(`Contraseña actualizada para usuario ID: ${id}`);
    
    // Recargar el usuario actualizado desde la base de datos
    const usuarioActualizado = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'correo', 'nombreCompleto', 'activo', 'empresaId', 'rolId', 'areaId', 'telefono', 'creadoEn'],
    });
    
    if (!usuarioActualizado) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado después de actualizar`);
    }
    
    // Verificar que el hash se guardó correctamente
    const usuarioConPassword = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'contrasena'],
    });
    
    if (usuarioConPassword) {
      const passwordMatches = await PasswordUtil.compare(newPassword, usuarioConPassword.contrasena);
      if (!passwordMatches) {
        this.logger.error(`Error: El hash guardado no coincide con la contraseña para usuario ID: ${id}`);
        throw new BadRequestException('Error al guardar la nueva contraseña. El hash no coincide.');
      }
      this.logger.debug(`Verificación exitosa: La contraseña se guardó correctamente para usuario ID: ${id}`);
    }
    
    return usuarioActualizado as Usuario;
  }

  async toggleActivo(id: number, activo: boolean): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.activo = activo ? 1 : 0;
    return this.usuarioRepository.save(usuario);
  }

  async cambiarEmpresa(id: number, empresaId: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.empresaId = empresaId;
    return this.usuarioRepository.save(usuario);
  }

  async cambiarRol(id: number, rolId: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.rolId = rolId;
    return this.usuarioRepository.save(usuario);
  }
}

