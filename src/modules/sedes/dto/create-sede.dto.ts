import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSedeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  empresaId: number;

  @ApiProperty({ example: 'Sede Principal' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Calle 123 #45-67', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;
}

