import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller({
  version: '1',
  path: 'tasks',
})
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    const curUserId = req?.user?.id;
    if (!curUserId) {
      throw new Error('User not found');
    }
    await this.taskService.createTaskValidator(createTaskDto);
    const newTask = await this.taskService.createTask(createTaskDto, curUserId);
    return newTask;
  }

  @Get('/')
  async getTasks(@Req() req) {
    const curUserId = req?.user?.id;
    if (!curUserId) {
      throw new Error('User not found');
    }
    const data = await this.taskService.getTasks(curUserId);
    return { data };
  }
}
