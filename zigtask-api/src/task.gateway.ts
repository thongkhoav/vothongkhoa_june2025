import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TaskService } from './task/task.service';

@WebSocketGateway({ cors: true })
export class TaskGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly taskService: TaskService) {}

  @SubscribeMessage('update_task')
  async handleTaskUpdate(@MessageBody() data: { id: string; status: string }) {
    const updated = await this.taskService.updateTaskStatusSocket(
      data.id,
      data.status,
    );
    this.server.emit('task_updated', updated); // broadcast to all clients
  }
}
