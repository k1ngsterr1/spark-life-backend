import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';
import { TranscriptService } from './transcript.service';
import { UploadDto } from './dto/upload-file.dto';

@ApiTags('Transcription')
@Controller('transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload .wav file and get transcript' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Patient & doctor IDs + .wav file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        patient_id: { type: 'integer', example: 1 },
        doctor_id: { type: 'integer', example: 2 },
        file: { type: 'string', format: 'binary' },
      },
      required: ['patient_id', 'doctor_id', 'file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `file-${Date.now()}${ext}`); // → uploads/transcript/file.wav
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() !== '.wav')
          return cb(
            new HttpException('Only .wav files are allowed!', 400),
            false,
          );
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @Body() body: UploadDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ text: string }> {
    if (!file) throw new HttpException('No file uploaded', 400);
    return this.transcriptService.transcribe(
      file,
      body.patient_id,
      body.doctor_id, // ← передаём именно doctor_id
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all transcripts by patient_id or doctor_id' })
  async getTranscripts(
    @Query('patient_id') patient_id?: number,
    @Query('doctor_id') doctor_id?: number,
  ) {
    return this.transcriptService.getTranscripts(patient_id, doctor_id);
  }
}
