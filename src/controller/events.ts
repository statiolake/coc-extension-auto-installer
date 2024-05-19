import { LinesTextDocument } from 'coc.nvim';
import { createContainer } from '../containerFactory';

const cancelledLanguages = {};

export const onDidOpenTextDocument = async (e: LinesTextDocument) => {
  if (cancelledLanguages[e.languageId]) {
    // Never ask for the once cancelled language again
    return;
  }

  const container = createContainer({ silent: true });
  const config = container.configLoader.load();
  const res = await container.installExtensionUsecase.handle({
    autoExecution: config.autoInstallLanguage,
    language: e.languageId,
  });

  if (res.detail === 'cancelled') {
    cancelledLanguages[e.languageId] = true;
  }
};
