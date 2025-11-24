import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventarioFisicoDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  activoId: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ubicacionVerificada?: string;
}

