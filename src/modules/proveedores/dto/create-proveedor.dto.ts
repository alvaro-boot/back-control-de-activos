import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProveedorDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  empresaId: number;

  @ApiProperty({ example: 'Dell Technologies' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'ventas@dell.com', required: false })
  @IsString()
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'Calle 123 #45-67', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;
}

