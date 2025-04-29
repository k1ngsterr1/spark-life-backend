import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

// test

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.notificationService.create(
        createNotificationDto,
      );
      return notification;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications (with pagination)' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.notificationService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  async findOne(@Param('id') id: string) {
    const notification = await this.notificationService.findOne(+id);
    if (!notification) {
      throw new HttpException('Notification not found', 404);
    }
    return notification;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification by ID' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    try {
      const updated = await this.notificationService.update(
        +id,
        updateNotificationDto,
      );
      return updated;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async remove(@Param('id') id: string) {
    try {
      const deleted = await this.notificationService.remove(+id);
      return deleted;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
