import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';
import type { Settings, UpdateSettingsDto } from '@pt/shared';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async get(@Req() req): Promise<Settings> {
    return this.settingsService.get(req.user.id);
  }

  @Put()
  async update(@Req() req, @Body() dto: UpdateSettingsDto): Promise<Settings> {
    return this.settingsService.update(req.user.id, dto);
  }
}
