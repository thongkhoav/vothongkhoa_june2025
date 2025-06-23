import { axiosBase } from "@/utils/axios/axiosBase";
import type {
  RegisterResponse,
  RegisterDto,
  LoginResponse,
  LoginDto,
} from "@/utils/types/user.type";
import type { AxiosInstance } from "axios";

export const registerUserApi = async (
  data: RegisterDto
): Promise<RegisterResponse> => {
  const res = await axiosBase.post("/auth/register", data);
  return res.data.data;
};

export const loginUserApi = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await axiosBase.post("/auth/login", data);
  return response;
};

export const logoutUserApi = async (
  axios: AxiosInstance,
  fcmToken?: string
): Promise<void> => {
  await axios.post("/auth/logout", {
    fcmToken: fcmToken || "",
  });
};
