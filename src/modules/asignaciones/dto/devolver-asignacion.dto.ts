import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DevolverAsignacionDto {
  @ApiProperty({ example: '2024-01-20T10:00:00', required: false })
  @IsDateString()
  @IsOptional()
  fechaDevolucion?: string;
}

