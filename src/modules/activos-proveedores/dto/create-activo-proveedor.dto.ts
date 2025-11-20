import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivoProveedorDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  proveedorId: number;

  @ApiProperty({ example: 'FAC-2024-001', required: false })
  @IsString()
  @IsOptional()
  numeroFactura?: string;
}

