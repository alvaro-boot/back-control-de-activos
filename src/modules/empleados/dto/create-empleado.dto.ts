import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpleadoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  empresaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Desarrollador', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargo?: string;

  @ApiProperty({ example: 'juan@empresa.com', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  correo?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  telefono?: string;
}

