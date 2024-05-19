import { populate as populateRequestedExtensions } from '../domain/logic/populateRequestedExtensionService';
import {
  getInstalledExtensions,
  selectTargets,
} from '../domain/logic/service/installService';
import { InstallGlobalExtensionsInteractor } from '../domain/usecaseInterface/installGlobalExtensionsUsecase';

export type InstallGlobalExtensionsUsecase =
  InstallGlobalExtensionsInteractor;

export const create = (): InstallGlobalExtensionsUsecase => {
  return {
    handle: async (container, request) => {
      const config = container.configLoader.load();
      const requested = populateRequestedExtensions(config);
      const installed = getInstalledExtensions();
      const targets = selectTargets(requested, installed);
      const res = await installExtensionsIfNotInstalled(
        wanted,
        config.autoCheckGlobalExtensions === 'autoInstall'
      );
      switch (res) {
        case 'allInstalled':
          if (showMessage) {
            await window.showInformationMessage(
              'All language extensions are installed.'
            );
          }
          break;
        case 'noExtensionSelected':
          await window.showInformationMessage('No extensions are selected.');
          break;
      }
    },
  };
};
