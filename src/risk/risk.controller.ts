import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RiskService } from './risk.service';

@ApiTags('Risk')
@Controller('risk')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('calculate/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Calculate and update the risk profile for a user' })
  @ApiResponse({
    status: 200,
    description:
      'The risk profile has been calculated and updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async calculateRisk(@Request() req): Promise<any> {
    return this.riskService.calculateRiskProfile(req.user.id);
  }
}
