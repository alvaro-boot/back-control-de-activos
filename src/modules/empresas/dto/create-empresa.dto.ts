import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDto {
  @ApiProperty({ example: 'Empresa S.A.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: '123456789-1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nit: string;

  @ApiProperty({ example: 'Calle 123 #45-67', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  telefono?: string;

  @ApiProperty({ example: 'contacto@empresa.com', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  correo?: string;
}

