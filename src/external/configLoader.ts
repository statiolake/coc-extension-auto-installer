import { workspace } from 'coc.nvim';
import { ConfigLoaderInterface } from '../domain/externalInterface/configLoaderInterface';
import { ConfigSchema } from '../domain/logic/entity/config';

export const createConfigLoader = (): ConfigLoaderInterface => {
  return {
    load: () => {
      const config = workspace.getConfiguration('extension-auto-installer');

      return ConfigSchema.parse({
        autoUninstallUnused: config.get('autoUninstallUnused'),
        autoInstallGlobal: config.get('autoInstallGlobal'),
        autoInstallLanguage: config.get('autoInstallLanguage'),
        globalExtensions: config.get('globalExtensions'),
        workspaceExtensions: config.get('workspaceExtensions'),
        languageExtensions: config.get('languageExtensions'),
      });
    },
  };
};
