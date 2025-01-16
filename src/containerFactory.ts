import { window } from 'coc.nvim';
import { ServiceContainer } from './domain/externalInterface/container';
import { createConfigLoader } from './external/configLoader';
import { createExtensionClient } from './external/extensionClient';
import { createUserPrompt } from './external/userPrompt';
import { createInstallExtensionsUsecase } from './usecase/installExtensionUsecase';
import { createUninstallUnusedExtensionsUsecase } from './usecase/uninstallUnusedExtensionUsecase';

const channel = window.createOutputChannel('extension-auto-installer');

export const createContainer = (opts: {
  silent?: boolean;
}): ServiceContainer => {
  const configLoader = createConfigLoader();
  const userPrompt = createUserPrompt({ silent: opts.silent });
  const extensionClient = createExtensionClient();

  const installExtensionUsecase = createInstallExtensionsUsecase(
    extensionClient,
    configLoader,
    userPrompt
  );
  const uninstallUnusedExtensionUsecase =
    createUninstallUnusedExtensionsUsecase(
      extensionClient,
      configLoader,
      userPrompt
    );

  return {
    channel,

    configLoader,
    userPrompt,

    installExtensionUsecase,
    uninstallUnusedExtensionUsecase,
  };
};
