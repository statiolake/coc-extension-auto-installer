export type Extension = {
  id: string;
};

export type RequestedExtension = Extension & {
  languages: { isGlobal: true } | { isGlobal: false; names: string[] };
};
