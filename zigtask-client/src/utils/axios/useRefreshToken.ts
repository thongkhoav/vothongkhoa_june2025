import { axiosBase } from "./axiosBase";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { READ_ENV } from "../constants/env";
import type { User } from "../types/user.type";
import useAuthStore from "@/store/useAuthStore";

const useRefreshToken = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const refresh = async () => {
    try {
      const response = await axiosBase.post("/auth/refresh", {
        refresh_token: localStorage.getItem(READ_ENV.COOKIE_REFRESH),
      });
      const accessToken = Cookies.get(READ_ENV.COOKIE_AUTH);
      // const user = JSON.parse(data?.value || "{}");
      console.log("RF AppWrapper user", response.data);
      if (accessToken) {
        const decodedToken: User = jwtDecode(accessToken);
        if (decodedToken) {
          setUser({
            sub: decodedToken.sub,
            email: decodedToken.email,
            fullName: decodedToken.fullName,
            tokens: {
              accessToken: accessToken,
            },
          });
          console.log("new rf user:", decodedToken);
        }
      }
      if (response.data?.refresh_token) {
        // set local storage
        localStorage.setItem(
          READ_ENV.COOKIE_REFRESH,
          response.data.refresh_token
        );
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  return refresh;
};

export default useRefreshToken;
