import { PartialType } from '@nestjs/swagger';
import { CreateActivoProveedorDto } from './create-activo-proveedor.dto';

export class UpdateActivoProveedorDto extends PartialType(CreateActivoProveedorDto) {}

