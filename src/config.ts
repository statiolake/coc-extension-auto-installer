import { workspace } from 'coc.nvim';
import { Config, ConfigSchema } from './types';

export function loadConfig(): Config {
  const config = workspace.getConfiguration('extension-auto-installer');

  return ConfigSchema.parse({
    autoUninstallUnused: config.get('autoUninstallUnused'),
    autoInstallGlobal: config.get('autoInstallGlobal'),
    autoInstallLanguage: config.get('autoInstallLanguage'),
    globalExtensions: config.get('globalExtensions'),
    workspaceExtensions: config.get('workspaceExtensions'),
    languageExtensions: config.get('languageExtensions'),
  });
}
