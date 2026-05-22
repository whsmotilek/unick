import { createRoot } from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext";
import { DataStoreProvider } from "./app/store/DataStore";
import { WaitlistProvider } from "./app/context/WaitlistContext";
import { Toaster } from "./app/components/ui/sonner";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <DataStoreProvider>
      <WaitlistProvider>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </WaitlistProvider>
    </DataStoreProvider>
  </AuthProvider>
);
