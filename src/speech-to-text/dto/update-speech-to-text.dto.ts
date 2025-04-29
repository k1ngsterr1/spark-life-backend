import { PartialType } from '@nestjs/swagger';
import { CreateSpeechToTextDto } from './create-speech-to-text.dto';

export class UpdateSpeechToTextDto extends PartialType(CreateSpeechToTextDto) {}
