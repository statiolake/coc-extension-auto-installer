import { Config } from './config';
import { RequestedExtension } from './extension';

export const populate = (config: Config): RequestedExtension[] => {
  const globalExtensions = [
    ...config.globalExtensions,
    ...config.workspaceExtensions,
  ];

  const extensionLanguageMap = {};
  for (const id of globalExtensions) {
    extensionLanguageMap[id] = [];
  }

  for (const language in config.languageExtensions) {
    const ids = config.languageExtensions[language];
    for (const id of ids) {
      extensionLanguageMap[id] = extensionLanguageMap[id] || [];
      extensionLanguageMap[id].push(language);
    }
  }

  const requestedExtensions = Object.keys(extensionLanguageMap).map((id) => {
    const languages = {
      isGlobal: extensionLanguageMap[id].length === 0,
      names: extensionLanguageMap[id],
    };

    return { id, languages };
  });

  return requestedExtensions;
};
