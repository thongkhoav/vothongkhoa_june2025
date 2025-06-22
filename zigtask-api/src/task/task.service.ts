import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TASK_STATUS } from './entities/task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createTaskValidator(task: CreateTaskDto): Promise<void> {
    // check if dueDate is valid
    if (task.dueDate < new Date()) {
      throw new BadRequestException('Due date is invalid');
    }
  }

  async createTask(task: CreateTaskDto, userId: string): Promise<Task> {
    let newTask = new Task({});
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    newTask.title = task.title;
    newTask.description = task.description;
    newTask.dueDate = task.dueDate;
    newTask.status = TASK_STATUS.TODO;
    newTask.user = user;

    newTask = await this.taskRepository.save(newTask);
    console.log('Task created');
    return newTask;
  }

  async getTasks(userId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return tasks;
  }

  async updateTaskValidator(
    taskId: string,
    task: UpdateTaskDto,
  ): Promise<void> {
    // check if dueDate is valid
    if (task.dueDate < new Date()) {
      throw new BadRequestException('Due date is invalid');
    }

    // check if task exists
    const existTask = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    console.log('existTask', existTask);
    if (!existTask) {
      throw new NotFoundException('Task not found');
    }
  }

  async updateTask(taskId: string, task: UpdateTaskDto): Promise<void> {
    const existTask = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    await this.taskRepository.update(
      { id: taskId },
      {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
      },
    );
  }

  async deleteTask(id: string): Promise<void> {
    const existTask = await this.taskRepository.findOne({
      where: { id: id },
    });

    if (!existTask) {
      throw new NotFoundException('Task not found');
    }

    // soft delete
    await this.taskRepository.softDelete({ id });
  }
}
