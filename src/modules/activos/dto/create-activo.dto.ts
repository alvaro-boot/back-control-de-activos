import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoActivo } from '../entities/activo.entity';

export class CreateActivoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  empresaId: number;

  @ApiProperty({ example: 'ACT-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @ApiProperty({ example: 'Laptop Dell Latitude 5520' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Laptop empresarial para desarrollo', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  categoriaId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  sedeId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  areaId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  responsableId?: number;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsDateString()
  @IsOptional()
  fechaCompra?: string;

  @ApiProperty({ example: 1500000, required: false })
  @IsNumber()
  @IsOptional()
  valorCompra?: number;

  @ApiProperty({ example: 1350000, required: false })
  @IsNumber()
  @IsOptional()
  valorActual?: number;

  @ApiProperty({
    example: 'activo',
    enum: EstadoActivo,
    required: false,
  })
  @IsEnum(EstadoActivo)
  @IsOptional()
  estado?: EstadoActivo;
}
