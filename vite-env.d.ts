interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
