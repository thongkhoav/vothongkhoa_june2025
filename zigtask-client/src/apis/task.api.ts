import type {
  CreateTaskDto,
  CreateTaskResponse,
  GetTaskListResponse,
  Task,
  UpdateTaskDto,
} from "@/utils/types/task.type";
import type { AxiosInstance } from "axios";

export const getTaskListApi = async (axios: AxiosInstance): Promise<Task[]> => {
  const res = await axios.get<GetTaskListResponse>("/tasks");
  return res.data.data;
};

export const createTaskApi = async (
  axios: AxiosInstance,
  data: CreateTaskDto
): Promise<Task> => {
  const response = await axios.post<CreateTaskResponse>("/tasks", data);
  return response.data.data;
};

export const updateTaskApi = async (
  axios: AxiosInstance,
  taskId: string,
  data: UpdateTaskDto
): Promise<Task> => {
  const response = await axios.put<CreateTaskResponse>(
    "/tasks/" + taskId,
    data
  );
  return response.data.data;
};

export const deleteTaskApi = async (
  axios: AxiosInstance,
  taskId: string
): Promise<void> => {
  await axios.delete("/tasks/" + taskId);
};
