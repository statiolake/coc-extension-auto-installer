import { workspace } from 'coc.nvim';
import { createContainer } from '../containerFactory';
import { AutoExecution } from '../domain/logic/entity/config';

export const installGlobalExtensions = async () => {
  const container = createContainer({ silent: false });
  const config = container.configLoader.load();
  const res = await container.installExtensionUsecase.handle({
    autoExecution: neverToConfirm(config.autoGlobalInstall),
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
  const res = await container.installExtensionUsecase.handle({
    autoExecution: neverToConfirm(config.autoLanguageInstall),
    language: language,
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

export const uninstallUnusedExtensions = async () => {
  const container = createContainer({ silent: false });
  const config = container.configLoader.load();
  const res = await container.uninstallUnusedExtensionUsecase.handle({
    autoExecution: neverToConfirm(config.autoUninstallUnused),
  });

  switch (res.detail) {
    case 'success':
      container.userPrompt.show('Complete');
      break;
    case 'nothingFound':
      container.userPrompt.show('No unused extensions found');
      break;
    case 'cancelled':
      container.userPrompt.show('Cancelled by user');
      break;
  }
};

const neverToConfirm = (autoExecution: AutoExecution): AutoExecution => {
  if (autoExecution === 'never') {
    return 'confirm';
  }

  return autoExecution;
};
