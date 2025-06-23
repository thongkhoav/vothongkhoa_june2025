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

  async updateTaskStatusSocket(taskId: string, status: string): Promise<Task> {
    // check if task exists
    const existTask = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (!existTask) {
      throw new NotFoundException('Task not found');
    }

    existTask.status = status as TASK_STATUS;

    // update task status
    const updated = await this.taskRepository.save(existTask);
    console.log('Task status updated:', taskId, status);
    return updated;
  }

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

  async getTasks(
    userId: string,
    status: string,
    search: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Task[]> {
    if (status && !Object.values(TASK_STATUS).includes(status as TASK_STATUS)) {
      throw new BadRequestException('Invalid task status');
    }
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('task.createdAt', 'DESC');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere('LOWER(task.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    if (startDate) {
      const start = new Date(startDate);
      query.andWhere('task.dueDate >= :startDate', { startDate: start });
    }
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);

    if (endDate) {
      const end = new Date(endDate);
      query.andWhere('task.dueDate <= :endDate', { endDate: end });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      query.andWhere('task.dueDate BETWEEN :startDate AND :endDate', {
        startDate: start,
        endDate: end,
      });
    }

    return await query.getMany();
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
