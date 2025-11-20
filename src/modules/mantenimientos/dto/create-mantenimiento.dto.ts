import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoMantenimiento } from '../entities/mantenimiento.entity';

export class CreateMantenimientoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  tecnicoId: number;

  @ApiProperty({ example: 'Mantenimiento preventivo de limpieza' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada: string;

  @ApiProperty({
    example: 'programado',
    enum: EstadoMantenimiento,
    required: false,
  })
  @IsEnum(EstadoMantenimiento)
  @IsOptional()
  estado?: EstadoMantenimiento;
}

