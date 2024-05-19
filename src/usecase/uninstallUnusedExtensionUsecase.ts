import { ServiceContainer } from '../domain/externalInterface/container';
import { AutoExecution } from '../domain/logic/entity/config';
import { Extension } from '../domain/logic/entity/extension';
import {
  findUnusedExtensions,
  getInstalledExtensions,
  uninstallExtensions,
} from '../domain/logic/service/installService';
import { populateRequestedExtensions } from '../domain/logic/service/populateRequestedExtensionService';
import { UninstallUnusedExtensionsInteractor } from '../domain/usecaseInterface/uninstallUnusedExtensionsUsecase';

export type UninstallUnusedExtensionsUsecase =
  UninstallUnusedExtensionsInteractor;

export const create = (
  container: ServiceContainer
): UninstallUnusedExtensionsUsecase => {
  return {
    handle: async (request) => {
      const config = container.configLoader.load();
      const requested = populateRequestedExtensions(config);
      const installed = getInstalledExtensions();
      const targets = findUnusedExtensions(requested, installed);
      if (targets.length === 0) {
        return {
          detail: 'nothingFound',
        };
      }

      const selection = await askUser(
        container,
        request.autoExecution,
        targets
      );

      if (selection.length === 0) {
        return {
          detail: 'cancelled',
        };
      }

      await uninstallExtensions(selection);

      return {
        detail: 'success',
      };
    },
  };
};

const askUser = async (
  container: ServiceContainer,
  autoExecution: AutoExecution,
  targets: Extension[]
): Promise<Extension[]> => {
  if (targets.length === 0) {
    return [];
  }

  if (autoExecution === 'never') {
    return [];
  }

  if (autoExecution === 'auto') {
    return targets;
  }

  const option = await container.userPrompt.prompt(
    [
      'There are extensions that are not used anymore. Uninstall?',
      targets.map((extension) => extension.id).join(', '),
    ].join('\n'),
    [
      { id: 'uninstall', label: 'Uninstall' },
      { id: 'select', label: 'Select which extensions to uninstall' },
      { id: 'notNow', label: 'Not now' },
    ]
  );

  if (!option || option.id === 'notNow') {
    return [];
  }

  if (option.id === 'uninstall') {
    return targets;
  }

  const selected = await container.userPrompt.promptMany(
    'Select extensions to uninstall',
    targets.map((extension) => ({
      id: extension.id,
      label: extension.id,
    }))
  );

  if (!selected) {
    return [];
  }

  return selected.map((selected) => ({ id: selected.id }));
};
