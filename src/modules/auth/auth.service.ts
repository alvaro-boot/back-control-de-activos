import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.usuariosService.findByEmail(loginDto.correo);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await PasswordUtil.compare(
      loginDto.password,
      usuario.contrasena,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

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
      role: usuario.rol?.nombre || 'empleado',
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
        nombre: usuario.nombreCompleto,
        correo: usuario.correo,
        role: usuario.rol?.nombre || 'empleado',
        empresaId: usuario.empresaId,
      },
    };
  }
}

