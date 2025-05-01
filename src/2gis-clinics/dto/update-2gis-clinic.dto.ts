import { PartialType } from '@nestjs/swagger';
import { Create2gisClinicDto } from './create-2gis-clinic.dto';

export class Update2gisClinicDto extends PartialType(Create2gisClinicDto) {}
