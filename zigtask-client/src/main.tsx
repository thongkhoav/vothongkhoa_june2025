// import { StrictMode } from "react";
import { Provider } from "@/components/ui/provider";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes/routes.tsx";
import { ToastContainer } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <>
    <Provider>
      <AppRoutes />
    </Provider>
    <ToastContainer />
  </>
  // </StrictMode>,
);
