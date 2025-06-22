import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore";
import Cookies from "js-cookie";
import { READ_ENV } from "./utils/constants";
import type { User } from "./utils/types/user.type";
import { jwtDecode } from "jwt-decode";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const accessToken = Cookies.get(READ_ENV.COOKIE_AUTH);
    const refreshToken = Cookies.get(READ_ENV.COOKIE_REFRESH);
    // const user = JSON.parse(data?.value || "{}");
    console.log("AppWrapper user", accessToken);
    console.log("AppWrapper refreshToken", refreshToken);
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
        console.log("Decoded user:", decodedToken);
      }
    }
  }, []);

  return <div>{children}</div>;
}
