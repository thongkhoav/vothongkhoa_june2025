import { useEffect } from "react";
import { axiosBase } from "./axiosBase";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import useAuthStore from "@/store/useAuthStore";
import { READ_ENV } from "../constants";
import { useNavigate } from "react-router-dom";

const useAxiosPrivate = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  useEffect(() => {
    const requestIntercept = axiosBase.interceptors.request.use(
      async (config: any) => {
        // if (!config.headers["Authorization"]) {
        //   config.headers["Authorization"] = `Bearer ${user?.accessToken}`;
        // }
        const accessToken = Cookies.get(READ_ENV.COOKIE_AUTH);
        if (accessToken) {
          if (accessToken && jwtDecode(accessToken).exp! * 1000 < Date.now()) {
            // logout and redirect to login page
            // window.location.href = "/login";
            setUser(null);
            Cookies.remove(READ_ENV.COOKIE_AUTH);
            navigate("/login", { replace: true });
          }
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // if access token is expired, response will throw back, use refresh token to get new access token
    const responseIntercept = axiosBase.interceptors.response.use(
      (response: any) => response,
      async (error: { config: any; response: { status: number } }) => {
        // const prevRequest = error?.config;
        // 500 expire
        // 401 user no longer exist
        // if (
        //   (error?.response?.status === 500 ||
        //     error?.response?.status === 401) &&
        //   !prevRequest?.sent
        // ) {
        //   prevRequest.sent = true;

        //   const newAccessToken = await refresh();
        //   prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        //   return axiosBase(prevRequest);
        // }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosBase.interceptors.request.eject(requestIntercept);
      axiosBase.interceptors.response.eject(responseIntercept);
    };
  }, []);

  return axiosBase;
};

export default useAxiosPrivate;
