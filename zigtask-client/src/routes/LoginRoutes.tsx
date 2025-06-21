import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PATH } from "@/utils/constants/paths";
import Loading from "@/components/custom/Loading";
const LoginPage = lazy(() => import("@/pages/login/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/login/RegisterPage"));

export default function LoginRoutes() {
  return (
    <Routes>
      <Route
        path={PATH.LOGIN}
        Component={() => (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        )}
      />
      <Route
        path={PATH.REGISTER}
        Component={() => (
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        )}
      />
    </Routes>
  );
}
