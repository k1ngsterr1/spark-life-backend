import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AnalysisService } from './analysis.service';

@ApiTags('AI Анализ')
@Controller('analysis')
@ApiBearerAuth('JWT')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('diagnose-from-image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image')) // 👈 загружаем файл
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Получить расшифровку анализа по изображению (AI) и сохранить',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  async diagnoseFromImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<any> {
    // например, сохранить изображение в S3 или отдать в AIService напрямую
    return this.analysisService.diagnoseFromImage(req.user.id, file);
  }
}
