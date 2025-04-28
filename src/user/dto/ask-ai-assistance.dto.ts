import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AskAiAssistanceDto {
  @ApiProperty({
    example: 'Hello! I have a problem with hyperlordosis, how can I treat it?',
    description: 'User question to AI assistant',
  })
  @IsString()
  query: string;
}
