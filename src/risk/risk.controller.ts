import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
  Get,
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

  @Post('calculate')
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

  @Get('report')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get the URL of the risk report PDF for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a JSON with the public URL of the PDF.',
    schema: {
      example: {
        url: 'https://api.example.com/uploads/medical_report_42_1683038400000.pdf',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Risk profile or report not found.',
  })
  async getRiskReport(@Request() req): Promise<{ url: string }> {
    const userId = req.user.id;
    const { filename } = await this.riskService.getRiskReport(userId);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `https://spark-life-backend-production-d81a.up.railway.app/uploads/${filename}`;

    return { url };
  }
}
