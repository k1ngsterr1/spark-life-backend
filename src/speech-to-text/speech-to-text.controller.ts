import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SpeechToTextService } from './speech-to-text.service';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Speech-to-Text')
@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(
    private readonly speechService: SpeechToTextService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('analyze-anxiety')
  @UseInterceptors(
    FileInterceptor('audios', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Analyze user anxiety level based on three answers',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload exactly three audio files (answers to 3 questions)',
    schema: {
      type: 'object',
      properties: {
        audios: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Anxiety level and summary',
    schema: {
      type: 'object',
      properties: {
        anxiety_level: { type: 'number', example: 45 },
        summary: { type: 'string', example: 'Умеренный уровень тревожности.' },
      },
    },
  })
  async analyzeAnxiety(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    if (!files || files.length !== 3) {
      throw new Error('Необходимо загрузить ровно 3 аудиофайла с ответами.');
    }

    // --- Ручная проверка токена без UseGuards ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Нет токена авторизации');
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const userId = payload?.id || payload?.sub;

    if (!userId) {
      throw new Error('Не найден пользователь в токене');
    }

    // --- Транскрипция аудиофайлов ---
    const transcribedAnswers = await Promise.all(
      files.map((file) => this.speechService.transcribeAudio(file)),
    );

    // --- Анализ уровня тревожности ---
    const anxietyResult = await this.speechService.analyzeAnxietyLevel(
      userId,
      transcribedAnswers,
    );

    return anxietyResult;
  }
}
