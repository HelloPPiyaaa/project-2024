/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_DOMAIN: string;
  ล;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
