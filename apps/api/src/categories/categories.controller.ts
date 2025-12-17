import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@pt/shared';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Req() req): Promise<Category[]> {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(req.user.id, id);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(req.user.id, dto);
  }

  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<Category> {
    return this.categoriesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string): Promise<void> {
    return this.categoriesService.delete(req.user.id, id);
  }
}
