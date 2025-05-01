import { Module } from '@nestjs/common';
import { TwoGisClinicController } from './2gis-clinics.controller';
import { TwoGisClinicService } from './2gis-clinics.service';

@Module({
  controllers: [TwoGisClinicController],
  providers: [TwoGisClinicService],
})
export class TwogisClinicsModule {}
