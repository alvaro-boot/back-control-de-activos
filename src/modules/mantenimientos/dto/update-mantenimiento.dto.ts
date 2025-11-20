import { PartialType } from '@nestjs/swagger';
import { CreateMantenimientoDto } from './create-mantenimiento.dto';
import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMantenimientoDto extends PartialType(CreateMantenimientoDto) {
  @ApiProperty({ example: '2024-02-16', required: false })
  @IsDateString()
  @IsOptional()
  fechaRealizacion?: string;
}

