import { LinesTextDocument } from 'coc.nvim';
import { createContainer } from '../containerFactory';

export const onDidOpenTextDocument = async (e: LinesTextDocument) => {
  const container = createContainer({ silent: true });
  const config = container.configLoader.load();
  container.installExtensionUsecase.handle({
    autoExecution: config.autoLanguageInstall,
    language: e.languageId,
  });
};
