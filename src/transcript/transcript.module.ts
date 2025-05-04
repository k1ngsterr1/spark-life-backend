import { Module } from '@nestjs/common';
import { TranscriptController } from './transcript.controller';
import { TranscriptService } from './transcript.service';
import { SharedModule } from 'src/shared/shared.module';
import { SpeechToTextService } from 'src/speech-to-text/speech-to-text.service';

@Module({
  imports: [SharedModule],
  controllers: [TranscriptController],
  providers: [TranscriptService, SpeechToTextService],
})
export class TranscriptModule {}
