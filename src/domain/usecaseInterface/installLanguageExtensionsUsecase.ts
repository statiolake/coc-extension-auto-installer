export type InstallLanguageExtensionsRequest = {
  language: string;
};

export type InstallLanguageExtensionsResponse = {
  detail: 'success' | 'alreadyInstalled' | 'cancelled';
};

export type InstallLanguageExtensionsInteractor = {
  handle: (
    request: InstallLanguageExtensionsRequest
  ) => Promise<InstallLanguageExtensionsResponse>;
};
