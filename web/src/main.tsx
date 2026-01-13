import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AudioPlayerProvider } from "./components/player/AudioPlayerContext.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioPlayerProvider>
      <App />
    </AudioPlayerProvider>
    <Toaster
      position="bottom-center"
      reverseOrder={false}
    />
  </StrictMode>
);
