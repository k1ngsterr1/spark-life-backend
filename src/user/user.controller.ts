import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
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

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('JWT')
export class UserController {
  private readonly baseUrl: string;
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    this.baseUrl = nodeEnv === 'development' ? 'http://localhost:3000' : '';
  }

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Reset password for authenticated user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() data: ResetPasswordDto, @Request() request) {
    data.email = request.user.email;
    return this.userService.resetPassword(data);
  }

  @Post('update-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Body() data: UpdateUserDto, @Request() request) {
    return this.userService.updateUserProfile(request.user.id, data);
  }
}
