import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { SpeechToTextController } from './speech-to-text.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [SpeechToTextController],
  providers: [SpeechToTextService, PrismaService],
})
export class SpeechToTextModule {}
