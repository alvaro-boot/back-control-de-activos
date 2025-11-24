import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: number;
    nombreCompleto: string;
    correo: string;
    telefono?: string;
    activo: number;
    empresaId: number;
    rolId: number;
    areaId?: number;
    role?: {
      id: number;
      nombre: string;
    };
    empresa?: any;
    area?: any;
  };
}

