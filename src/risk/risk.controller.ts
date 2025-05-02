import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
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
  @ApiOperation({ summary: 'Calculate and update the risk profile for a user' })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user to calculate the risk profile for',
  })
  @ApiResponse({
    status: 200,
    description:
      'The risk profile has been calculated and updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async calculateRisk(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.riskService.calculateRiskProfile(userId);
  }
}
