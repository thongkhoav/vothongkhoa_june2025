import { loginUserApi } from "@/apis/user.api";
import useAuthStore from "@/store/useAuthStore";
import type { LoginDto, User } from "@/utils/types/user.type";
import { Button, Field, Input, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { READ_ENV } from "@/utils/constants/env";
import { AxiosError } from "axios";
export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await loginUserApi(data);
      toast.success("Login successful!");
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
      navigate("/");
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error("login error:", error.response.data);
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  });

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={onSubmit} className="w-full max-w-[500px]">
        <Stack
          gap="4"
          align="flex-start"
          shadow={"md"}
          p="6"
          borderRadius="md"
          height={"fit-content"}
        >
          <Text fontWeight={700} fontSize={32}>
            Login
          </Text>
          <Field.Root invalid={!!errors.email}>
            <Field.Label>
              Email <Field.RequiredIndicator />
            </Field.Label>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email format",
                },
              })}
            />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>
              Password <Field.RequiredIndicator />
            </Field.Label>
            <Input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>
          <div className="text-blue-500 hover:underline">
            <Link to="/register" replace>
              Don't have an account? Register here
            </Link>
          </div>
          <Button type="submit" backgroundColor={"teal.500"} width={"100%"}>
            Submit
          </Button>
        </Stack>
      </form>
    </div>
  );
}
