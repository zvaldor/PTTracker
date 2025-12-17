import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@pt/shared';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(@Req() req): Promise<Task[]> {
    return this.tasksService.findAll(req.user.id);
  }

  @Get('plan/:planSlot')
  async findByPlanSlot(@Req() req, @Param('planSlot') planSlot: string): Promise<Task[]> {
    return this.tasksService.findByPlanSlot(req.user.id, planSlot);
  }

  @Get('recurring/frequent')
  async findRecurringFrequent(@Req() req): Promise<Task[]> {
    return this.tasksService.findRecurringFrequent(req.user.id);
  }

  @Get('backlog')
  async findBacklog(@Req() req): Promise<Task[]> {
    return this.tasksService.findBacklog(req.user.id);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(req.user.id, dto);
  }

  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateTaskDto): Promise<Task> {
    return this.tasksService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string): Promise<void> {
    return this.tasksService.delete(req.user.id, id);
  }
}
