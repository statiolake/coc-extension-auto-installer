import { OutputChannel } from 'coc.nvim';
import { InstallExtensionsInteractor } from '../usecaseInterface/installExtensionsUsecase';
import { UninstallUnusedExtensionsInteractor } from '../usecaseInterface/uninstallUnusedExtensionsUsecase';
import { ConfigLoaderInterface } from './configLoaderInterface';
import { UserPromptInterface } from './userPromptInterface';

export type ServiceContainer = {
  channel: OutputChannel;

  configLoader: ConfigLoaderInterface;
  userPrompt: UserPromptInterface;

  installExtensionUsecase: InstallExtensionsInteractor;
  uninstallUnusedExtensionUsecase: UninstallUnusedExtensionsInteractor;
};
