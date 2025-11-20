import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsignacionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  empleadoId: number;

  @ApiProperty({ example: '2024-01-15T10:00:00', required: false })
  @IsDateString()
  @IsOptional()
  fechaAsignacion?: string;
}

