import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
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

  @ApiProperty({ example: 'Mantenimiento preventivo mensual', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ 
    example: ['Revisar sistema eléctrico', 'Limpiar filtros', 'Verificar funcionamiento'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tareas?: string[];
}

