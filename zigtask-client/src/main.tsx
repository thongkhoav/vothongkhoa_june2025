// import { StrictMode } from "react";
import { Provider } from "@/components/ui/provider";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes/routes.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider>
    <AppRoutes />
  </Provider>
  // </StrictMode>,
);
