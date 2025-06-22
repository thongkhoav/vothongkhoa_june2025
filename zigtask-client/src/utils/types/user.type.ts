import type { AxiosResponse } from "axios";

export interface User {
  sub: string;
  email: string;
  fullName: string;
  tokens: {
    accessToken: string;
  };
}
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse extends AxiosResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse extends AxiosResponse {
  data: string;
}
