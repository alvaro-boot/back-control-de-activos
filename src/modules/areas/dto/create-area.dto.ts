import { IsString, IsNotEmpty, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  empresaId: number;

  @ApiProperty({ example: 'Recursos Humanos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}

