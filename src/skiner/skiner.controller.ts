//test

import {
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkiniverService } from './skiner.service';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Skiniver')
@Controller('skiniver')
@ApiBearerAuth('JWT')
export class SkiniverController {
  constructor(private readonly skiniverService: SkiniverService) {}

  @Post('predict')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('img'))
  @ApiOperation({ summary: 'Predict skin condition by uploaded image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file for skin analysis',
    schema: {
      type: 'object',
      properties: {
        img: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Prediction result from Skiniver AI',
  })
  async predict(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) throw new Error('Файл не загружен');

    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, `upload_${Date.now()}.jpg`);
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(filePath, file.buffer);
    const result = await this.skiniverService.predict(file);
    const gradcamPath = await this.skiniverService.generateGradcam(filePath);
    await this.skiniverService.saveSkinCheck(req.user.id, result);

    return {
      status: 'ok',
      result,
      gradcam: gradcamPath
        ? `https://spark-life-backend-production-d81a.up.railway.app/uploads/${path.basename(gradcamPath)}`
        : null,
    };
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user skin check history' })
  @ApiResponse({
    status: 200,
    description: 'List of previous skin checks',
  })
  async getHistory(@Request() req) {
    const history = await this.skiniverService.getSkinCheckHistory(req.user.id);
    return {
      status: 'ok',
      history,
    };
  }

  @Post('gradcam')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('img'))
  @ApiOperation({
    summary: 'Generate a simulated Grad-CAM from uploaded image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to create Grad-CAM visualization',
    schema: {
      type: 'object',
      properties: {
        img: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Simulated Grad-CAM overlay result',
    content: {
      'application/json': {
        example: {
          status: 'ok',
          gradcam:
            'https://yourdomain.com/uploads/upload_123456789_gradcam.jpg',
        },
      },
    },
  })
  async generateGradcam(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Файл не загружен');

    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, `upload_${Date.now()}.jpg`);
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(filePath, file.buffer);

    const gradcamPath = await this.skiniverService.generateGradcam(filePath);

    return {
      status: 'ok',
      gradcam: gradcamPath
        ? `https://yourdomain.com/uploads/${path.basename(gradcamPath)}`
        : null,
    };
  }
}
