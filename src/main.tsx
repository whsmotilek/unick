import { createRoot } from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext";
import { Toaster } from "./app/components/ui/sonner";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </AuthProvider>
);
