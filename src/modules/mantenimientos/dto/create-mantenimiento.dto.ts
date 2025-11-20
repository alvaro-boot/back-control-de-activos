import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoMantenimiento } from '../entities/mantenimiento.entity';

export class CreateMantenimientoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  tecnicoId: number;

  @ApiProperty({ example: 'preventivo', enum: TipoMantenimiento })
  @IsEnum(TipoMantenimiento)
  @IsNotEmpty()
  tipo: TipoMantenimiento;

  @ApiProperty({ example: 'Limpieza y revisión general del equipo', required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  fechaMantenimiento: string;

  @ApiProperty({ example: 50000, required: false })
  @IsNumber()
  @IsOptional()
  costo?: number;
}
