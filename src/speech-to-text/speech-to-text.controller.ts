import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SpeechToTextService } from './speech-to-text.service';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserAuthGuard } from 'src/shared/guards/user.auth.guard';

@ApiTags('Speech-to-Text')
@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private readonly speechService: SpeechToTextService) {}

  @Post('analyze-anxiety')
  @UseInterceptors(FilesInterceptor('audios'))
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

    // Здесь userId, например из авторизации
    console.log('user', req.user);

    const user = req.user as any; // тебе нужно, чтобы req.user содержал id пользователя через авторизацию
    console.log('user', user);
    const userId = user?.sub || user?.id;

    if (!userId) {
      throw new Error('Не найден пользователь.');
    }

    // Транскрибируем каждый файл
    const transcribedAnswers = await Promise.all(
      files.map((file) => this.speechService.transcribeAudio(file)),
    );

    // Анализируем уровень тревожности
    const anxietyResult = await this.speechService.analyzeAnxietyLevel(
      userId,
      transcribedAnswers,
    );

    return anxietyResult;
  }
}
