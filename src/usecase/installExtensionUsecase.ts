import { Mutex } from 'coc.nvim';
import { ConfigLoaderInterface } from '../domain/externalInterface/configLoaderInterface';
import { UserPromptInterface } from '../domain/externalInterface/userPromptInterface';
import { AutoExecution } from '../domain/logic/entity/config';
import { Extension } from '../domain/logic/entity/extension';
import {
  findMissingExtensions,
  getInstalledExtensions,
  installExtensions,
} from '../domain/logic/service/installService';
import { populateRequestedExtensions } from '../domain/logic/service/populateRequestedExtensionService';
import { InstallExtensionsInteractor } from '../domain/usecaseInterface/installExtensionsUsecase';

export type InstallExtensionsUsecase = InstallExtensionsInteractor;

export const createInstallExtensionsUsecase = (
  installerMutex: Mutex,
  configLoader: ConfigLoaderInterface,
  userPrompt: UserPromptInterface
): InstallExtensionsUsecase => {
  return {
    handle: async (request) => {
      // Keep the max concurrent installers to 1
      return await installerMutex.use(async () => {
        const config = configLoader.load();
        const requested = populateRequestedExtensions(config);
        const installed = getInstalledExtensions();
        const targets = findMissingExtensions(
          requested,
          installed,
          request.language
        );
        if (targets.length === 0) {
          return {
            detail: 'alreadyInstalled',
          };
        }

        const selection = await askUser(
          userPrompt,
          request.autoExecution,
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
      });
    },
  };
};

const askUser = async (
  userPrompt: UserPromptInterface,
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

  const option = await userPrompt.prompt(
    [
      'There are extensions that are not installed. Install?',
      targets.map((extension) => extension.id).join(', '),
    ].join('\n'),
    [
      { id: 'install', label: 'Install' },
      { id: 'select', label: 'Select which extensions to install' },
      { id: 'notNow', label: 'Not now' },
    ]
  );

  if (!option || option.id === 'notNow') {
    return [];
  }

  if (option.id === 'install') {
    return targets;
  }

  const selected = await userPrompt.promptMany(
    'Select extensions to install',
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
