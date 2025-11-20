import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGarantiaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ example: 'Dell Technologies', required: false })
  @IsString()
  @IsOptional()
  proveedor?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({ example: '2027-01-15', required: false })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiProperty({ example: 'GC-2024-001', required: false })
  @IsString()
  @IsOptional()
  numeroContrato?: string;

  @ApiProperty({ example: 'garantias@dell.com', required: false })
  @IsString()
  @IsOptional()
  correoContacto?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsString()
  @IsOptional()
  telefonoContacto?: string;
}

