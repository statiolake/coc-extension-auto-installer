import { ConfigLoaderInterface } from './configLoaderInterface';
import { UserPromptInterface } from './userPromptInterface';

export type ServiceContainer = {
  configLoader: ConfigLoaderInterface;
  userPrompt: UserPromptInterface;
};
