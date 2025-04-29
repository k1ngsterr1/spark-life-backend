import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { WeeklyStatisticDto } from './dto/weekly-statistic.dto';
import { AIService } from 'src/shared/services/ai.service';
import { AskAiAssistanceDto } from './dto/ask-ai-assistance.dto';
import { UserAuthGuard } from 'src/shared/guards/user.auth.guard';
import { PrismaService } from 'src/shared/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

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
    description: 'AI generated general advice based on user query',
  })
  async askAiAssistance(@Body() dto: any) {
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

  @Get('ai-stats')
  @ApiOperation({
    summary: 'Get AI-based health advice (sleep hours and water intake)',
    description:
      "Analyzes user diseases, age, gender, height, weight and returns recommended daily sleep and water intake in user's language (ru/en).",
  })
  @ApiBearerAuth()
  async getRecomendationServices(@Request() request) {
    const userLanguage = request.headers['accept-language']?.includes('ru')
      ? 'ru'
      : 'en';
    console.log(userLanguage);
    return await this.aiService.getRecommendationServices(
      request.user,
      userLanguage,
    );
  }
}
