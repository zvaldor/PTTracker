import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Settings, UpdateSettingsDto } from '@pt/shared';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string): Promise<Settings | null> {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) return null;

    return {
      ...settings,
      weekStartsOn: settings.weekStartsOn as any,
      difficultyMode: settings.difficultyMode as any,
      tshirtLabels: settings.tshirtLabels as any,
      hourPresets: settings.hourPresets as any,
    };
  }

  async update(userId: string, dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.prisma.settings.update({
      where: { userId },
      data: dto as any,
    });

    return {
      ...settings,
      weekStartsOn: settings.weekStartsOn as any,
      difficultyMode: settings.difficultyMode as any,
      tshirtLabels: settings.tshirtLabels as any,
      hourPresets: settings.hourPresets as any,
    };
  }
}
