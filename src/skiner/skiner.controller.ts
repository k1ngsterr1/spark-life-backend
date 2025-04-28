import {
  Controller,
  Post,
  UploadedFile,
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
} from '@nestjs/swagger';
import { Express } from 'express';

@ApiTags('Skiniver')
@Controller('skiniver')
export class SkiniverController {
  constructor(private readonly skiniverService: SkiniverService) {}

  @Post('predict')
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
    content: {
      'application/json': {
        example: {
          status: 'ok',
          result: {
            acne: 0.2,
            wrinkles: 0.5,
            pigmentation: 0.1,
          },
        },
      },
    },
  })
  async predict(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Файл не загружен');
    }

    return this.skiniverService.predict(file);
  }
}
