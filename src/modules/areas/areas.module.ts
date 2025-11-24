import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { Area } from './entities/area.entity';
import { SedesModule } from '../sedes/sedes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Area]),
    SedesModule,
  ],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService],
})
export class AreasModule {}

