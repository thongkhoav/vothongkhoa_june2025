import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";
import { PATH } from "@/utils/constants/paths";
import Loading from "@/components/custom/Loading";
import useAuthStore from "@/store/useAuthStore";
const LoginPage = lazy(() => import("@/pages/guest/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/guest/RegisterPage"));

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function LoginRoutes() {
  return (
    <Routes>
      <Route
        path={PATH.LOGIN}
        Component={() => (
          <GuestRoute>
            <Suspense fallback={<Loading />}>
              <LoginPage />
            </Suspense>
          </GuestRoute>
        )}
      />
      <Route
        path={PATH.REGISTER}
        Component={() => (
          <GuestRoute>
            <Suspense fallback={<Loading />}>
              <RegisterPage />
            </Suspense>
          </GuestRoute>
        )}
      />
    </Routes>
  );
}
