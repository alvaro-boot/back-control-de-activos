import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMantenimientoDto } from './create-mantenimiento.dto';

export class UpdateMantenimientoDto extends PartialType(CreateMantenimientoDto) {
  @ApiProperty({ example: 'Informe técnico detallado...', required: false })
  @IsString()
  @IsOptional()
  informeTecnico?: string;
}
