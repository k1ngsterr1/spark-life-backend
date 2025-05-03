import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DentalCheckService } from './dental-check.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Dental Check')
@Controller('dental-check')
@ApiBearerAuth('JWT')
export class DentalCheckController {
  constructor(private readonly dentalCheckService: DentalCheckService) {}

  @Post('analyze')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Анализ зубов по изображению через Roboflow + AI' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  async analyze(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const base64 = file.buffer.toString('base64').replace(/\n/g, '');
    const mimeType = file.mimetype; // например, 'image/jpeg'
    const base64Url = `data:${mimeType};base64,${base64}`;

    return this.dentalCheckService.analyze(req.user.id, base64Url);
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'История анализов зубов пользователя' })
  async getHistory(@Request() req) {
    return this.dentalCheckService.getHistory(req.user.id);
  }
}
