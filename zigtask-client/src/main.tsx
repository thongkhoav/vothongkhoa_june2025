// import { StrictMode } from "react";
import { Provider } from "@/components/ui/provider";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes/routes.tsx";
import { ToastContainer } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <>
    <Provider>
      <DndProvider backend={HTML5Backend}>
        <AppRoutes />
      </DndProvider>
    </Provider>
    <ToastContainer />
  </>
  // </StrictMode>,
);
