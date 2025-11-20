import { IsString, IsNotEmpty, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  sedeId: number;

  @ApiProperty({ example: 'Recursos Humanos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;
}

