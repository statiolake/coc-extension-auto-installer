import { ServiceContainer } from '../domain/externalInterface/container';
import {
  askUserForTargets,
  getInstalledExtensions,
  installExtensions,
  selectTargets,
} from '../domain/logic/service/installService';
import { populateRequestedExtensions } from '../domain/logic/service/populateRequestedExtensionService';
import { InstallExtensionsInteractor } from '../domain/usecaseInterface/installExtensionsUsecase';

export type InstallExtensionsUsecase = InstallExtensionsInteractor;

export const create = (
  container: ServiceContainer
): InstallExtensionsUsecase => {
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
        request.autoExecution,
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
