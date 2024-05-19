import { Mutex, window } from 'coc.nvim';
import { ServiceContainer } from './domain/externalInterface/container';
import { createConfigLoader } from './external/configLoader';
import { createUserPrompt } from './external/userPrompt';
import { createInstallExtensionsUsecase } from './usecase/installExtensionUsecase';
import { createUninstallUnusedExtensionsUsecase } from './usecase/uninstallUnusedExtensionUsecase';

const channel = window.createOutputChannel('extension-auto-installer');
const installerMutex = new Mutex();

export const createContainer = (opts: {
  silent?: boolean;
}): ServiceContainer => {
  const configLoader = createConfigLoader();
  const userPrompt = createUserPrompt({ silent: opts.silent });
  const installExtensionUsecase = createInstallExtensionsUsecase(
    installerMutex,
    configLoader,
    userPrompt
  );
  const uninstallUnusedExtensionUsecase =
    createUninstallUnusedExtensionsUsecase(configLoader, userPrompt);

  return {
    channel,
    installerMutex,

    configLoader,
    userPrompt,

    installExtensionUsecase,
    uninstallUnusedExtensionUsecase,
  };
};
