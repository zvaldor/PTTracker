import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@pt/shared';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        color: dto.color,
        isEnabled: dto.isEnabled ?? true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
