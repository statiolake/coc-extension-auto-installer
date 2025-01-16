export type Extension = {
  id: string;

  /** true if the plugins is loaded from runtime path. */
  isRuntimePathPlugin: boolean;
};

export type RequestedExtension = Extension & {
  languages: { isGlobal: true } | { isGlobal: false; names: string[] };
};
