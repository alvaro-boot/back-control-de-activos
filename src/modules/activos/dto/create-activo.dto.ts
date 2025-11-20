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

  @ApiProperty({ example: 'Laptop Dell', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @ApiProperty({ example: 'Computador', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tipo?: string;

  @ApiProperty({ example: 'Dell', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  marca?: string;

  @ApiProperty({ example: 'Latitude 5520', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  modelo?: string;

  @ApiProperty({ example: 'SN123456789', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  numeroSerie?: string;

  @ApiProperty({ example: 1500000, required: false })
  @IsNumber()
  @IsOptional()
  valor?: number;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsDateString()
  @IsOptional()
  fechaCompra?: string;

  @ApiProperty({
    example: 'operativo',
    enum: EstadoActivo,
    required: false,
  })
  @IsEnum(EstadoActivo)
  @IsOptional()
  estado?: EstadoActivo;
}

