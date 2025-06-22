import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";
import Loading from "@/components/custom/Loading";
import useAuthStore from "@/store/useAuthStore";
const TaskListPage = lazy(() => import("@/pages/user/TaskListPage"));

interface UserRouteProps {
  children: ReactNode;
}

export function UserRoute({ children }: UserRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/">
        <Route
          index
          Component={() => (
            <UserRoute>
              <Suspense fallback={<Loading />}>
                <TaskListPage />
              </Suspense>
            </UserRoute>
          )}
        />
      </Route>
    </Routes>
  );
}
