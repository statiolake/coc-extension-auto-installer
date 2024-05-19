import { AutoExecution } from '../logic/entity/config';

export type InstallExtensionsRequest = {
  autoExecution: AutoExecution;
  language?: string;
};

export type InstallExtensionsResponse = {
  detail: 'success' | 'alreadyInstalled' | 'cancelled';
};

export type InstallExtensionsInteractor = {
  handle: (
    request: InstallExtensionsRequest
  ) => Promise<InstallExtensionsResponse>;
};
