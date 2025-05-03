import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Get,
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
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('AI Анализ')
@Controller('analysis')
@ApiBearerAuth('JWT')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('diagnose-from-image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // 👈 папка для сохранения
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
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
    return this.analysisService.diagnoseFromImage(req.user.id, file);
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'История медицинских анализов пользователя' })
  async getHistory(@Request() req) {
    return this.analysisService.getHistory(req.user.id);
  }
}
