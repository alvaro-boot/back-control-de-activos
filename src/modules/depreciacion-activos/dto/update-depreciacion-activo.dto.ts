import { PartialType } from '@nestjs/swagger';
import { CreateDepreciacionActivoDto } from './create-depreciacion-activo.dto';

export class UpdateDepreciacionActivoDto extends PartialType(
  CreateDepreciacionActivoDto,
) {}

