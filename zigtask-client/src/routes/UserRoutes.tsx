import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PATH } from "@/utils/constants/paths";
import Loading from "@/components/custom/Loading";
const TaskListPage = lazy(() => import("@/pages/user/TaskListPage"));

export default function LoginRoutes() {
  return (
    <Routes>
      <Route
        path={PATH.TASKS}
        Component={() => (
          <Suspense fallback={<Loading />}>
            <TaskListPage />
          </Suspense>
        )}
      />
    </Routes>
  );
}
