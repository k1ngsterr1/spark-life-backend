import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
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
        userId: { type: 'integer', example: 1 },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['userId', 'file'],
    },
  })
  async analyze(@UploadedFile() file: Express.Multer.File, @Request() req) {
    // Преобразуем файл в base64 и удаляем переносы строк
    const base64 = file.buffer.toString('base64').replace(/\n/g, '');
    const mimeType = file.mimetype; // например, 'image/jpeg'
    const base64Url = `data:${mimeType};base64,${base64}`;

    return this.dentalCheckService.analyze(req.user.id, base64Url);
  }
}
