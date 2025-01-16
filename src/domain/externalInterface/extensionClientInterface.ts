import { Extension } from '../logic/entity/extension';

export type ExtensionClientInterface = {
  getInstalledExtensions(): Extension[];
  installExtensions(targets: Extension[]): Promise<void>;
  uninstallExtensions(targets: Extension[]): Promise<void>;
};
