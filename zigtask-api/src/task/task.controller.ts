import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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

  @Put('/:taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    console.log('Updating task with ID:', taskId);
    await this.taskService.updateTaskValidator(taskId, dto);
    await this.taskService.updateTask(taskId, dto);
    return { message: 'Task updated' };
  }

  @Delete('/:taskId')
  async delete(@Param('taskId') taskId: string) {
    console.log('Deleting task with ID:', taskId);
    await this.taskService.deleteTask(taskId);
    return { message: 'Task deleted' };
  }
}
