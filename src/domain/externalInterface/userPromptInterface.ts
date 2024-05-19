export type Option = {
  id: string;
  label: string;
};

export type UserPromptInterface = {
  show: (message: string) => void;
  prompt: (message: string, options: Option[]) => Option;
};
