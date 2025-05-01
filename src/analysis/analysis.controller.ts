import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service'; // ✅ поменяли AIService на AnalysisService

@ApiTags('AI Анализ')
@Controller('analysis')
@ApiBearerAuth('JWT')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('diagnose-from-image')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Получить расшифровку анализа по изображению (AI) и сохранить',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
      },
      required: ['userId', 'imageUrl'],
    },
  })
  async diagnoseFromImage(
    @Body() body: { userId: number; imageUrl: string },
  ): Promise<any> {
    return this.analysisService.diagnoseFromImage(body.userId, body.imageUrl);
  }
}
