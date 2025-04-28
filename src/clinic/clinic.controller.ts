import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Clinics')
@Controller('clinics')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new clinic' })
  @ApiBody({ type: CreateClinicDto })
  @ApiResponse({ status: 201, description: 'Clinic created' })
  async create(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicService.create(createClinicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clinics' })
  @ApiResponse({ status: 200, description: 'List of clinics' })
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.clinicService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clinic by id' })
  @ApiResponse({ status: 200, description: 'Clinic found' })
  async findOne(@Param('id') id: string) {
    return this.clinicService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update clinic by id' })
  @ApiBody({ type: UpdateClinicDto })
  @ApiResponse({ status: 200, description: 'Clinic updated' })
  async update(
    @Param('id') id: string,
    @Body() updateClinicDto: UpdateClinicDto,
  ) {
    return this.clinicService.update(id, updateClinicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete clinic by id' })
  @ApiResponse({ status: 200, description: 'Clinic deleted' })
  async remove(@Param('id') id: string) {
    return this.clinicService.remove(id);
  }
}
