import { ServiceContainer } from '../externalInterface/container';

export type InstallGlobalExtensionsRequest = Record<never, never>;

export type InstallGlobalExtensionsResponse = Record<never, never>;

export type InstallGlobalExtensionsInteractor = {
  handle: (
    container: ServiceContainer,
    request: InstallGlobalExtensionsRequest
  ) => Promise<InstallGlobalExtensionsResponse>;
};
