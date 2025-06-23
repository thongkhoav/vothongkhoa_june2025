import { registerUserApi } from "@/apis/user.api";
import type { RegisterDto } from "@/utils/types/user.type";
import { Button, Field, Input, Stack, Text } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerUserApi(data);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response?.data?.message || "Registration failed");
        console.log(error);
        return;
      }
      toast.error("An unexpected error occurred during registration.");
      console.error("Registration error:", error);
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
            Register User
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

          <Field.Root invalid={!!errors.fullName}>
            <Field.Label>
              Full name <Field.RequiredIndicator />
            </Field.Label>
            <Input
              {...register("fullName", {
                required: "Full name is required",
              })}
            />
            <Field.ErrorText>{errors.fullName?.message}</Field.ErrorText>
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
              type="password"
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>
          <div className="text-blue-500 hover:underline">
            <Link to="/login" replace>
              Already have an account? Login here
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
