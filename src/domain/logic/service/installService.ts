import { extensions } from 'coc.nvim';
import { Extension, RequestedExtension } from '../entity/extension';

export const getInstalledExtensions = (): Extension[] => {
  return extensions.all.map((api) => ({ id: api.id }));
};

export const findMissingExtensions = (
  requests: RequestedExtension[],
  installed: Extension[],
  onlyForLanguage?: string
): Extension[] => {
  return requests
    .filter((request) => {
      // Only select non-installed extensions
      return installed.every((extension) => extension.id !== request.id);
    })
    .filter((request) => {
      const languages = request.languages;
      return (
        (onlyForLanguage === undefined && languages.isGlobal) ||
        (onlyForLanguage !== undefined &&
          !languages.isGlobal &&
          languages.names.includes(onlyForLanguage))
      );
    });
};

export const findUnusedExtensions = (
  requests: RequestedExtension[],
  installed: Extension[]
): Extension[] => {
  return installed.filter((extension) => {
    return requests.every((request) => request.id !== extension.id);
  });
};

export const installExtensions = async (
  targets: Extension[]
): Promise<void> => {
  // installExtensions is not in type definitions but exists
  await (extensions as any).installExtensions(targets.map((e) => e.id));
};

export const uninstallExtensions = async (
  targets: Extension[]
): Promise<void> => {
  // uninstallExtensions is not in type definitions but exists
  (extensions as any).manager.uninstallExtensions(targets.map((e) => e.id));
};
