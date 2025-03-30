import { extensions, Mutex } from 'coc.nvim';
import { ExtensionClientInterface } from '../domain/externalInterface/extensionClientInterface';
import { Extension } from '../domain/logic/entity/extension';

export const createExtensionClient = (): ExtensionClientInterface => {
  const mutex = new Mutex();

  return {
    getInstalledExtensions: (): Extension[] => {
      return extensions.all.map((api) => {
        return {
          id: api.id,
          isRuntimePathPlugin:
            !api.extensionPath.includes('coc/extensions') &&
            !api.extensionPath.includes('coc\\extensions'),
        } as unknown as Extension;
      });
    },

    installExtensions: async (targets: Extension[]): Promise<void> => {
      // installExtensions is not in type definitions but exists
      return await mutex.use(
        async () =>
          await (extensions as any).installExtensions(
            targets.map((e) => e.id)
          )
      );
    },

    uninstallExtensions: async (targets: Extension[]): Promise<void> => {
      // uninstallExtensions is not in type definitions but exists
      return await mutex.use(
        async () =>
          await (extensions as any).manager.uninstallExtensions(
            targets.map((e) => e.id)
          )
      );
    },
  };
};
