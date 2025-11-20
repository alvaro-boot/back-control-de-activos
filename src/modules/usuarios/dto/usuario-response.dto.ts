import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  empresaId: number;

  @ApiProperty()
  rolId: number;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  correo: string;

  @ApiProperty()
  telefono: string;

  @ApiProperty()
  areaId: number;

  @ApiProperty()
  activo: number;

  @ApiProperty({ required: false })
  rol?: {
    id: number;
    nombre: string;
  };

  @ApiProperty({ required: false })
  empresa?: {
    id: number;
    nombre: string;
  };

  @ApiProperty({ required: false })
  area?: {
    id: number;
    nombre: string;
  };
}

