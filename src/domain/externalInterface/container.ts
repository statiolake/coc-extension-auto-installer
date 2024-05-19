import { InstallExtensionsInteractor } from '../usecaseInterface/installExtensionsUsecase';
import { UninstallUnusedExtensionsInteractor } from '../usecaseInterface/uninstallUnusedExtensionsUsecase';
import { ConfigLoaderInterface } from './configLoaderInterface';
import { UserPromptInterface } from './userPromptInterface';

export type ServiceContainer = {
  configLoader: ConfigLoaderInterface;
  userPrompt: UserPromptInterface;

  installExtensionUsecase: InstallExtensionsInteractor;
  uninstallUnusedExtensionUsecase: UninstallUnusedExtensionsInteractor;
};
