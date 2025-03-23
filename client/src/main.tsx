import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill for global required by PDF.js
if (typeof window !== "undefined" && typeof window.global === "undefined") {
  window.global = window;
}

createRoot(document.getElementById("root")!).render(<App />);
