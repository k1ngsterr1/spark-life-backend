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
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceService } from './service.service';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created' })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'List of services' })
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.serviceService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by id' })
  @ApiResponse({ status: 200, description: 'Service found' })
  async findOne(@Param('id') id: string) {
    return this.serviceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service by id' })
  @ApiResponse({ status: 200, description: 'Service updated' })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service by id' })
  @ApiResponse({ status: 200, description: 'Service deleted' })
  async remove(@Param('id') id: string) {
    return this.serviceService.remove(+id);
  }
}
