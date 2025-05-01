import { Module } from '@nestjs/common';
import { TwoGisClinicService } from './2gis-clinics.service';
import { TwoGisController } from './2gis-clinics.controller';

@Module({
  controllers: [TwoGisController],
  providers: [TwoGisClinicService],
})
export class TwogisClinicsModule {}
