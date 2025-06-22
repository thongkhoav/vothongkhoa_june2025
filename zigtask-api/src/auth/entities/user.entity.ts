import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';
import { LoginSession } from './login-session.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Column()
  email: string;

  // password
  @Column({ select: false })
  password: string;

  // full name
  @Column()
  fullName: string;

  @OneToMany(() => Task, (task) => task.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tasks: Task[];

  // many login session
  @OneToMany(() => LoginSession, (session) => session.user)
  sessions: LoginSession[];
}
