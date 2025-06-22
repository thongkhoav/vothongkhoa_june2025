import { BrowserRouter } from "react-router-dom";
import LoginRoutes from "./LoginRoutes";
import UserRoutes from "./UserRoutes";
import AppWrapper from "@/AppWrapper";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AppWrapper>
        <UserRoutes />
        <LoginRoutes />
      </AppWrapper>
    </BrowserRouter>
  );
}
