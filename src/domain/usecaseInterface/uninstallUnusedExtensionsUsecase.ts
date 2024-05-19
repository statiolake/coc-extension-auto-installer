import { AutoExecution } from '../logic/entity/config';

export type UninstallUnusedExtensionsRequest = {
  autoExecution: AutoExecution;
};

export type UninstallUnusedExtensionsResponse = {
  detail: 'success' | 'nothingFound' | 'cancelled';
};

export type UninstallUnusedExtensionsInteractor = {
  handle: (
    request: UninstallUnusedExtensionsRequest
  ) => Promise<UninstallUnusedExtensionsResponse>;
};
