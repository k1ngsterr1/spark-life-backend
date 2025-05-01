import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateClinicSearchDto } from './dto/create-2gis-clinic.dto';
import { TwoGisClinicService } from './2gis-clinics.service';
import { ClinicService } from 'src/clinic/clinic.service';

@ApiTags('Клиники (2GIS)')
@Controller('2gis-clinics')
export class TwoGisController {
  constructor(private readonly clinicService: TwoGisClinicService) {}

  @Get('search')
  @ApiOperation({ summary: 'Поиск клиник через 2GIS API' })
  @ApiQuery({ name: 'query', type: String, required: true })
  @ApiQuery({ name: 'city', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  async search(@Query() dto: CreateClinicSearchDto) {
    return this.clinicService.searchClinics(dto);
  }
}
