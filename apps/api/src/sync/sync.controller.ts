import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncService } from './sync.service';
import type { BulkSyncDto, SyncResponse } from '@pt/shared';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post()
  async sync(@Req() req, @Body() dto: BulkSyncDto): Promise<SyncResponse> {
    return this.syncService.sync(req.user.id, dto);
  }
}
