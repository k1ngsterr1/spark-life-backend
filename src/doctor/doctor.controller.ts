import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Doctors')
@Controller('doctors')
@ApiBearerAuth('JWT')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created' })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor by id' })
  @ApiResponse({ status: 200, description: 'Doctor updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(+id, updateDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.doctorService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by id' })
  @ApiResponse({ status: 200, description: 'Doctor found' })
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete doctor by id' })
  @ApiResponse({ status: 200, description: 'Doctor deleted' })
  async remove(@Param('id') id: string) {
    return this.doctorService.remove(+id);
  }

  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/doctor_photos', // Папка для загрузки
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `doctor-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Лимит 5MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload doctor photo' })
  @ApiResponse({ status: 201, description: 'Photo uploaded successfully' })
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return {
      path: `/uploads/doctor_photos/${file.filename}`,
    };
  }
}
