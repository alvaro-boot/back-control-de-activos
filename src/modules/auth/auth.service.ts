import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EmailService } from '../../common/services/email.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.debug(`Intento de login para: ${loginDto.correo}`);
    
    const usuario = await this.usuariosService.findByEmail(loginDto.correo);

    if (!usuario) {
      this.logger.warn(`Usuario no encontrado: ${loginDto.correo}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.debug(`Usuario encontrado: ID=${usuario.id}, Activo=${usuario.activo}`);

    if (!usuario.activo) {
      this.logger.warn(`Usuario inactivo: ${loginDto.correo}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar que la contraseña existe
    if (!usuario.contrasena) {
      this.logger.error(`Usuario sin contraseña: ${loginDto.correo}`);
      throw new UnauthorizedException('Usuario sin contraseña configurada');
    }

    this.logger.debug(`Comparando contraseña para usuario: ${usuario.id}`);
    const isPasswordValid = await PasswordUtil.compare(
      loginDto.password,
      usuario.contrasena,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Contraseña inválida para: ${loginDto.correo}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.debug(`Login exitoso para: ${loginDto.correo}`);
    return this.generateTokens(usuario);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usuariosService.findByEmail(
      registerDto.correo,
    );

    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashedPassword = await PasswordUtil.hash(registerDto.contrasena);

    const usuario = await this.usuariosService.create({
      ...registerDto,
      contrasena: hashedPassword,
    });

    return this.generateTokens(usuario);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const usuario = await this.usuariosService.findOneById(payload.sub);

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Token inválido');
      }

      return this.generateTokens(usuario);
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  private async generateTokens(usuario: any): Promise<AuthResponseDto> {
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      role: usuario.rol?.nombre || 'tecnico',
      empresaId: usuario.empresaId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        correo: usuario.correo,
        telefono: usuario.telefono,
        activo: usuario.activo ? 1 : 0,
        empresaId: usuario.empresaId,
        rolId: usuario.rolId,
        areaId: usuario.areaId,
        role: usuario.rol ? {
          id: usuario.rol.id,
          nombre: usuario.rol.nombre,
        } : undefined,
        empresa: usuario.empresa,
        area: usuario.area,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { correo } = forgotPasswordDto;
    const usuario = await this.usuariosService.findByEmail(correo);

    // Siempre responder genéricamente para evitar enumeración de usuarios
    if (!usuario) {
      this.logger.warn(`Intento de recuperación de contraseña para correo no existente: ${correo}`);
      return;
    }

    // Limpiar tokens antiguos no usados para este usuario
    await this.passwordResetTokenRepository.delete({
      usuarioId: usuario.id,
      usado: false,
    });

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    const resetToken = this.passwordResetTokenRepository.create({
      usuarioId: usuario.id,
      token,
      expiresAt,
    });
    await this.passwordResetTokenRepository.save(resetToken);

    const frontendUrl = this.configService.get<string>('frontend.url') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Enviar email con el enlace de recuperación
    try {
      await this.emailService.sendPasswordResetEmail(
        usuario.correo,
        resetLink,
        usuario.nombreCompleto,
      );
      this.logger.log(`Email de recuperación enviado a ${correo}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de recuperación: ${error.message}`);
      // En desarrollo, mostrar el enlace en los logs como fallback
      const nodeEnv = this.configService.get<string>('server.nodeEnv');
      if (nodeEnv === 'development') {
        this.logger.warn(`Enlace de recuperación (fallback): ${resetLink}`);
      }
      // No lanzar error para evitar exponer información
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, usado: false },
      relations: ['usuario'],
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token de recuperación inválido o expirado');
    }

    const usuario = resetToken.usuario;
    if (!usuario) {
      throw new BadRequestException('Usuario asociado al token no encontrado');
    }

    // Usar el método resetPassword de UsuariosService que ya maneja el hashing correctamente
    // Este método actualiza directamente en la base de datos sin hashear dos veces
    await this.usuariosService.resetPassword(usuario.id, newPassword);

    // Marcar el token como usado
    resetToken.usado = true;
    await this.passwordResetTokenRepository.save(resetToken);
    
    this.logger.log(`Contraseña del usuario ${usuario.correo} restablecida exitosamente.`);
  }
}

