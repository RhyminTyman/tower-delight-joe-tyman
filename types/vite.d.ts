declare module "*?url" {
  const result: string;
  export default result;
}

interface ImportMetaEnv {
  readonly VITE_TOWER_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
