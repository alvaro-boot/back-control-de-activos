import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepreciacionActivoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  anio: number;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorDepreciado: number;

  @ApiProperty({ example: 1350000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorRestante: number;
}

