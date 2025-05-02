import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
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

  @Get('reports')
  @ApiOperation({
    summary: 'Get all risk report PDF URLs for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a JSON array with the public URLs of all PDFs.',
    schema: {
      example: {
        urls: [
          'https://.../uploads/medical_report_42_1683038400001.pdf',
          'https://.../uploads/medical_report_42_1683038300456.pdf',
          // etc.
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No reports found.',
  })
  async listRiskReports(@Request() req): Promise<{ urls: string[] }> {
    const userId = req.user.id;
    const filenames = await this.riskService.listRiskReports(userId);

    // build full URLs
    const base = `${req.protocol}://${req.get('host')}/uploads`;
    const urls = filenames.map((fn) => `${base}/${fn}`);

    return { urls };
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
