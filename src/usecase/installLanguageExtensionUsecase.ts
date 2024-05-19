import { ServiceContainer } from '../domain/externalInterface/container';
import {
  askUserForTargets,
  getInstalledExtensions,
  installExtensions,
  selectTargets,
} from '../domain/logic/service/installService';
import { populateRequestedExtensions } from '../domain/logic/service/populateRequestedExtensionService';
import { InstallLanguageExtensionsInteractor } from '../domain/usecaseInterface/installLanguageExtensionsUsecase';

export type InstallLanguageExtensionsUsecase =
  InstallLanguageExtensionsInteractor;

export const create = (
  container: ServiceContainer
): InstallLanguageExtensionsUsecase => {
  return {
    handle: async (request) => {
      const config = container.configLoader.load();
      const requested = populateRequestedExtensions(config);
      const installed = getInstalledExtensions();
      const targets = selectTargets(requested, installed, request.language);
      if (targets.length === 0) {
        return {
          detail: 'alreadyInstalled',
        };
      }

      const selection = await askUserForTargets(
        config.autoCheckLanguageExtensions,
        container.userPrompt,
        targets
      );

      if (selection.length === 0) {
        return {
          detail: 'cancelled',
        };
      }

      await installExtensions(selection);

      return {
        detail: 'success',
      };
    },
  };
};
