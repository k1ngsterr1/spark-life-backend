import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  Param,
  UploadedFile,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { WeeklyStatisticDto } from './dto/weekly-statistic.dto';
import { AIService } from 'src/shared/services/ai.service';
import { AskAiAssistanceDto } from './dto/ask-ai-assistance.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  private readonly baseUrl: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {
    const baseUrl = this.configService.get<string>('BASE_URL');
    if (!baseUrl) {
      throw new Error('BASE_URL NOT SET IN .ENV');
    }
    this.baseUrl = baseUrl;
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // локальная папка
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `med-doc-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @Post(':userId/upload-medical-document')
  @ApiOperation({ summary: 'Распознать мед.документ через OCR (Vision)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'userId', required: true })
  @ApiBody({
    description: 'Медицинский документ',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Профиль обновлен' })
  @ApiBearerAuth()
  async uploadMedicalDocument(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('Файл не был загружен', 400);
    }

    const imageUrl = `${process.env.BASE_URL}/uploads/${file.filename}`;
    return this.aiService.processMedicalDocumentFromUrl(+userId, imageUrl);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password for authenticated user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() data: ResetPasswordDto, @Request() request) {
    data.email = request.user.email;
    return this.userService.resetPassword(data);
  }

  @Post('update-profile')
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Body() data: UpdateUserDto, @Request() request) {
    return this.userService.updateUserProfile(request.user.id, data);
  }

  @Post('weekly-statistic')
  @ApiOperation({ summary: 'Add weekly user statistics' })
  @ApiBody({ type: WeeklyStatisticDto })
  @ApiResponse({
    status: 200,
    description: 'Weekly statistic added successfully',
  })
  async addWeeklyStatistic(
    @Body() data: WeeklyStatisticDto,
    @Request() request,
  ) {
    return this.userService.addWeeklyStatistic(request.user.id, data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user data' })
  @ApiResponse({ status: 200, description: 'User data retrieved successfully' })
  async getMe(@Request() request) {
    return this.userService.getMe(request.user.id);
  }

  @Post('ai-assistance')
  @ApiOperation({
    summary:
      'Get AI-generated general assistance based on user query and profile',
  })
  @ApiBody({ type: AskAiAssistanceDto })
  @ApiResponse({
    status: 200,
    description:
      'AI generated text and audio advice based on user query and profile',
    schema: {
      example: {
        id: 'c67c1725-8a29-4b3a-9d87-1fef4769e1dc',
        text: 'Здравствуйте! Вам следует обратиться к терапевту...',
        audioPath: '/audio/c67c1725-8a29-4b3a-9d87-1fef4769e1dc.wav',
        sender: 'ai',
        timestamp: '2025-05-01T12:34:56.789Z',
      },
    },
  })
  async askAiAssistance(@Body() dto: AskAiAssistanceDto) {
    return this.aiService.askAiAssistance(dto);
  }

  @Get('ai-health-advice')
  @ApiOperation({
    summary: 'Get AI-generated health advice based on user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'AI generated personalized health advice',
  })
  async getHealthAdvice(@Request() request) {
    return this.aiService.getHealthAdvice(request.user);
  }

  @Get('ai-stats')
  @ApiOperation({
    summary: 'Get AI-based health advice (sleep hours and water intake)',
    description:
      "Analyzes user diseases, age, gender, height, weight and returns recommended daily sleep and water intake in user's language (ru/en).",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Recommended sleep and water intake based on user profile',
    schema: {
      type: 'object',
      properties: {
        daily_sleep: { type: 'string', example: '7-8 часов' },
        daily_water: { type: 'string', example: '2.5 литра' },
        recommendation: {
          type: 'string',
          example:
            'Рекомендуется увеличить количество воды и нормализовать сон.',
        },
      },
    },
  })
  async getAiStats(@Request() request) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header not found');
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (!payload?.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const userLanguage = request.headers['accept-language']?.includes('ru')
        ? 'ru'
        : 'en';
      console.log(userLanguage);

      return this.aiService.aiStats(user, userLanguage);
    } catch (error) {
      console.error('getAiStats error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Get('ai-recommendation')
  @ApiOperation({
    summary: 'Get AI-based recommendation of clinic services',
    description:
      'Analyzes user diseases and provides a services to treat them.',
  })
  @ApiBearerAuth()
  async getRecomendationServices(@Request() request) {
    const userLanguage = 'ru';

    console.log(userLanguage);
    return await this.aiService.getRecommendationServices(
      request.user.id,
      userLanguage,
    );
  }
}
