import { workspace } from 'coc.nvim';
import { createContainer } from '../containerFactory';

export const installGlobalExtensions = async () => {
  const container = createContainer({ silent: false });
  const config = container.configLoader.load();
  const res = await container.installExtensionUsecase.handle({
    autoExecution: config.autoGlobalInstall,
  });

  switch (res.detail) {
    case 'success':
      container.userPrompt.show('Complete');
      break;
    case 'alreadyInstalled':
      container.userPrompt.show('All extensions are already installed');
      break;
    case 'cancelled':
      container.userPrompt.show('Cancelled by user');
      break;
  }
};

export const installLanguageExtensions = async () => {
  const container = createContainer({ silent: false });
  const config = container.configLoader.load();
  const language = (await workspace.document).textDocument.languageId;
  container.installExtensionUsecase.handle({
    autoExecution: config.autoLanguageInstall,
    language: language,
  });
};

export const uninstallUnusedExtensions = async () => {
  const container = createContainer({ silent: false });
  const config = container.configLoader.load();
  container.uninstallUnusedExtensionUsecase.handle({
    autoExecution: config.autoUninstallUnused,
  });
};
