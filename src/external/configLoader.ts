import { workspace } from 'coc.nvim';
import { Configuration, ConfigurationSchema } from '../domain/config';

export const getConfiguration = (): Configuration => {
  const config = workspace.getConfiguration('extension-auto-installer');

  return ConfigurationSchema.parse({
    autoRemoveUnusedExtensions: config.get('autoRemoveUnusedExtensions'),
    autoCheckGlobalExtensions: config.get('autoCheckGlobalExtensions'),
    autoCheckLanguageExtensions: config.get('autoCheckLanguageExtensions'),
    globalExtensions: config.get('globalExtensions'),
    workspaceExtensions: config.get('workspaceExtensions'),
    languageExtensions: config.get('languageExtensions'),
  });
};
