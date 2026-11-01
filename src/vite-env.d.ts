/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK: string;
  readonly VITE_PUBLIC_DEMO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
