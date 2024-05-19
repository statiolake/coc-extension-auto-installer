import { ServiceContainer } from './domain/externalInterface/container';
import { createConfigLoader } from './external/configLoader';
import { createUserPrompt } from './external/userPrompt';
import { createInstallExtensionsUsecase } from './usecase/installExtensionUsecase';
import { createUninstallUnusedExtensionsUsecase } from './usecase/uninstallUnusedExtensionUsecase';

export const createContainer = (opts: {
  silent?: boolean;
}): ServiceContainer => {
  const configLoader = createConfigLoader();
  const userPrompt = createUserPrompt({ silent: opts.silent });
  const installExtensionUsecase = createInstallExtensionsUsecase(
    configLoader,
    userPrompt
  );
  const uninstallUnusedExtensionUsecase =
    createUninstallUnusedExtensionsUsecase(configLoader, userPrompt);
  return {
    configLoader,
    userPrompt,

    installExtensionUsecase,
    uninstallUnusedExtensionUsecase,
  };
};
