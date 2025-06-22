import { DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class SmallAbstractEntity<T> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn({ select: false })
  deletedAt?: Date;

  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
