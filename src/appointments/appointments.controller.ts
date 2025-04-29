import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentService } from './appointments.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Appointments')
@Controller('appointments')
@ApiBearerAuth('JWT')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async findAll() {
    return this.appointmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by id' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment by id' })
  @ApiResponse({ status: 200, description: 'Appointment updated' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get appointments by user ID' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments for the user',
  })
  async findByUserId(@Param('userId') userId: string) {
    return this.appointmentService.findByUserId(+userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment by id' })
  @ApiResponse({ status: 200, description: 'Appointment deleted' })
  async remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}
