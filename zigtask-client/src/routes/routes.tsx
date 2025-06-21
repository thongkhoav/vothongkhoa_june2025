import { BrowserRouter } from "react-router-dom";
import LoginRoutes from "./LoginRoutes";
import UserRoutes from "./UserRoutes";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <UserRoutes />
      <LoginRoutes />
    </BrowserRouter>
  );
}
