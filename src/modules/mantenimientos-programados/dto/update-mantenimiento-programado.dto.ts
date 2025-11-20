import { PartialType } from '@nestjs/swagger';
import { CreateMantenimientoProgramadoDto } from './create-mantenimiento-programado.dto';

export class UpdateMantenimientoProgramadoDto extends PartialType(
  CreateMantenimientoProgramadoDto,
) {}

