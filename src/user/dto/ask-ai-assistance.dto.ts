import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject } from 'class-validator';

export class AskAiAssistanceDto {
  @ApiProperty({
    example: 'Hello! I have a problem with hyperlordosis, how can I treat it?',
    description: 'User question to AI assistant',
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'User info (any fields)',
  })
  @IsObject()
  user: any;
}
