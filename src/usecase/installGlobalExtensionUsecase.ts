import { ServiceContainer } from '../domain/externalInterface/container';
import {
  askUserForTargets,
  getInstalledExtensions,
  installExtensions,
  selectTargets,
} from '../domain/logic/service/installService';
import { populateRequestedExtensions } from '../domain/logic/service/populateRequestedExtensionService';
import { InstallGlobalExtensionsInteractor } from '../domain/usecaseInterface/installGlobalExtensionsUsecase';

export type InstallGlobalExtensionsUsecase =
  InstallGlobalExtensionsInteractor;

export const create = (
  container: ServiceContainer
): InstallGlobalExtensionsUsecase => {
  return {
    handle: async () => {
      const config = container.configLoader.load();
      const requested = populateRequestedExtensions(config);
      const installed = getInstalledExtensions();
      const targets = selectTargets(requested, installed);
      if (targets.length === 0) {
        return {
          detail: 'alreadyInstalled',
        };
      }

      const selection = await askUserForTargets(
        config.autoCheckGlobalExtensions,
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
