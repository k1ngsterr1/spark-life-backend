import { IsString } from 'class-validator';

export class AskAiAssistanceDto {
  @IsString()
  query: string;
}
