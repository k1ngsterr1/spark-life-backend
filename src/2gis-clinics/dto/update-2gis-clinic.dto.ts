import { PartialType } from '@nestjs/swagger';
import { CreateClinicSearchDto } from './create-2gis-clinic.dto';

export class Update2gisClinicDto extends PartialType(CreateClinicSearchDto) {}
