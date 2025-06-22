// import { StrictMode } from "react";
import { Provider } from "@/components/ui/provider";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes/routes.tsx";
import { ToastContainer } from "react-toastify";
import AppWrapper from "./AppWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <>
    <Provider>
      <AppWrapper>
        <AppRoutes />
      </AppWrapper>
    </Provider>
    <ToastContainer />
  </>
  // </StrictMode>,
);
