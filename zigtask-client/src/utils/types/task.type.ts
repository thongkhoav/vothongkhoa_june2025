import type { AxiosResponse } from "axios";
import type { TASK_STATUS } from "../constants";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: TASK_STATUS;
}
export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate: Date;
  status: TASK_STATUS;
}

export interface UpdateTaskDto {
  title: string;
  description: string;
  dueDate: Date;
  status: TASK_STATUS;
}

export interface GetTaskListResponse extends AxiosResponse {
  data: Task[];
}

export interface CreateTaskResponse extends AxiosResponse {
  data: Task;
}

export interface UpdateTaskResponse extends AxiosResponse {
  data: Task;
}
