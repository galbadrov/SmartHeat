import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const parseFirebaseConfig = (raw?: string): FirebaseOptions | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as FirebaseOptions;
    if (parsed?.apiKey && parsed?.projectId) return parsed;
  } catch {
    // Fall through to key=value parsing.
  }

  const parts = trimmed
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length || !parts.every((part) => part.includes("="))) {
    return null;
  }

  const config: Record<string, string> = {};
  parts.forEach((part) => {
    const [key, ...rest] = part.split("=");
    if (!key || !rest.length) return;
    config[key.trim()] = rest.join("=").trim();
  });

  if (!config.apiKey || !config.projectId) return null;
  return config as FirebaseOptions;
};

const firebaseConfig = parseFirebaseConfig(import.meta.env.VITE_FIREBASE);

const app = firebaseConfig
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

const firestore = app ? getFirestore(app) : null;

export const isFirebaseConfigured = Boolean(firestore);
export { firestore };
