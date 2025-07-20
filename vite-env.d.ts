interface ImportMetaEnv {
  readonly VITE_BANK_ACCOUNT_NAME: string;
  readonly VITE_BANK_NAME: string;
  readonly VITE_BANK_BRANCH: string;
  readonly VITE_BANK_ACCOUNT_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
