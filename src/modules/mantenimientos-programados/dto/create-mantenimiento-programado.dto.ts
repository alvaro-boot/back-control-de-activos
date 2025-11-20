import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoMantenimientoProgramado } from '../entities/mantenimiento-programado.entity';

export class CreateMantenimientoProgramadoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  tecnicoId?: number;

  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada: string;

  @ApiProperty({
    example: 'pendiente',
    enum: EstadoMantenimientoProgramado,
    required: false,
  })
  @IsEnum(EstadoMantenimientoProgramado)
  @IsOptional()
  estado?: EstadoMantenimientoProgramado;
}

