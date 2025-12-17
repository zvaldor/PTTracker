import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import type { AnalyticsFilter, AnalyticsResponse } from '@pt/shared';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Req() req, @Query() filter: AnalyticsFilter): Promise<AnalyticsResponse> {
    return this.analyticsService.getAnalytics(req.user.id, filter);
  }
}
