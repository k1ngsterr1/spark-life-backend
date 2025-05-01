import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DentalCheckService } from './dental-check.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Dental Check')
@Controller('dental-check')
export class DentalCheckController {
  constructor(private readonly dentalCheckService: DentalCheckService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Анализ зубов по изображению через Roboflow + AI' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 1 },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['userId', 'file'],
    },
  })
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.dentalCheckService.analyze(userId, file);
  }
}
