export type InstallGlobalExtensionsRequest = Record<never, never>;

export type InstallGlobalExtensionsResponse = {
  detail: 'success' | 'alreadyInstalled' | 'cancelled';
};

export type InstallGlobalExtensionsInteractor = {
  handle: (
    request: InstallGlobalExtensionsRequest
  ) => Promise<InstallGlobalExtensionsResponse>;
};
