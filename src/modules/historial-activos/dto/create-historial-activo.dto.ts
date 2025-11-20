import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHistorialActivoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @ApiProperty({ example: 'Asignación de responsable' })
  @IsString()
  @IsNotEmpty()
  accion: string;

  @ApiProperty({ example: 'Se asignó nuevo responsable al activo', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  responsableAnteriorId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @IsOptional()
  responsableNuevoId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  areaAnteriorId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @IsOptional()
  areaNuevaId?: number;

  @ApiProperty({ example: 'activo', required: false })
  @IsString()
  @IsOptional()
  estadoAnterior?: string;

  @ApiProperty({ example: 'mantenimiento', required: false })
  @IsString()
  @IsOptional()
  estadoNuevo?: string;
}

