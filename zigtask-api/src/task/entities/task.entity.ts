import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from 'src/database/abstract.entity';
import { User } from 'src/auth/entities/user.entity';

export enum TASK_STATUS {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

@Entity()
export class Task extends AbstractEntity<Task> {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  dueDate: Date;

  @Column({ default: TASK_STATUS.TODO })
  status: string = TASK_STATUS.TODO;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;
}
