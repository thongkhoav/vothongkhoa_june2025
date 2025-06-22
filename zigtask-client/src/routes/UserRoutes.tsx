import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PATH } from "@/utils/constants/paths";
import Loading from "@/components/custom/Loading";
import useAuthStore from "@/store/useAuthStore";
const TaskListPage = lazy(() => import("@/pages/user/TaskListPage"));

export default function LoginRoutes() {
  const user = useAuthStore((state) => state.user);

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to={PATH.LOGIN} replace />;
  }
  return (
    <Routes>
      <Route path="/">
        <Route
          index
          Component={() => (
            <Suspense fallback={<Loading />}>
              <TaskListPage />
            </Suspense>
          )}
        />
      </Route>
    </Routes>
  );
}
