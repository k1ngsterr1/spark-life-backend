import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AskAiAssistanceDto {
  @ApiProperty({
    example: 'Hello! I have problem with gyperzhirdoz, how can i treat it?',
  })
  @IsString()
  query: string;
}
