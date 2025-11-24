import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoSolicitud } from '../entities/solicitud.entity';

export class CreateSolicitudDto {
  @ApiProperty({ enum: TipoSolicitud })
  @IsEnum(TipoSolicitud)
  @IsNotEmpty()
  tipo: TipoSolicitud;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  activoId?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  // Campos para traslado
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  sedeOrigenId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  sedeDestinoId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  areaOrigenId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  areaDestinoId?: number;

  // Campos para repuestos
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repuestoNombre?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  repuestoCantidad?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repuestoDescripcion?: string;
}

