import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerSW";
import { installSecureLogger } from "./lib/security/logger";

// Production-only console scrubber — strips JWTs, emails, UUIDs, phone numbers
// from any log/warn/error before they hit the browser console. Additive: no
// existing call sites change.
installSecureLogger();

createRoot(document.getElementById("root")!).render(<App />);
registerServiceWorker();
