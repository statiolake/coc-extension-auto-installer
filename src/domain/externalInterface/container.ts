import { UserPromptInterface } from './UserPromptInterface';
import { ConfigLoaderInterface } from './configLoaderInterface';

export type ServiceContainer = {
  configLoader: ConfigLoaderInterface;
  userPrompt: UserPromptInterface;
};
