import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
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

@ApiTags('Speech-to-Text')
@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private readonly speechService: SpeechToTextService) {}

  @Post('transcribe-multiple')
  @UseInterceptors(FilesInterceptor('audios'))
  @ApiOperation({
    summary: 'Transcribe multiple audio files using OpenAI Whisper',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple audio files (mp3, wav, etc.)',
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
    description: 'Transcribed text for each audio file',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string', example: 'voice1.mp3' },
          text: { type: 'string', example: 'Пример распознанного текста...' },
        },
      },
    },
  })
  async transcribeMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('Аудиофайлы не загружены');
    }

    const results = await Promise.all(
      files.map((file) => this.speechService.transcribeAudio(file)),
    );

    return results.map((text, index) => ({
      file: files[index].originalname,
      text,
    }));
  }
}
