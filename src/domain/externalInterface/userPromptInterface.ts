export type Option = {
  id: string;
  label: string;
};

export type UserPromptInterface = {
  show: (message: string) => Promise<void>;
  prompt: (message: string, options: Option[]) => Promise<Option | undefined>;
  promptMany: (
    message: string,
    options: Option[]
  ) => Promise<Option[] | undefined>;
};
