import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompletarMantenimientoProgramadoDto {
  @ApiProperty({ example: 'Mantenimiento completado exitosamente', required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ example: 'Disco duro 500GB, Memoria RAM 8GB', required: false })
  @IsString()
  @IsOptional()
  repuestosUtilizados?: string;

  @ApiProperty({ example: 30, required: false })
  @IsInt()
  @IsOptional()
  tiempoIntervencion?: number;

  @ApiProperty({ example: 'Informe técnico detallado...', required: false })
  @IsString()
  @IsOptional()
  informeTecnico?: string;

  @ApiProperty({ example: ['Tarea 1 completada', 'Tarea 2 completada'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tareasCompletadas?: string[];
}

