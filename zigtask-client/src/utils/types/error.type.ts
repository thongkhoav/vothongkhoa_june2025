import type { AxiosResponse } from "axios";

export interface ErrorResponse extends AxiosResponse {
  data: {
    statusCode: number;
    message: string;
    error: string;
  };
}
