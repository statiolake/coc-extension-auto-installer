import { commands, ExtensionContext, window, workspace } from 'coc.nvim';
import * as cmd from './commands';

const channel = window.createOutputChannel('extension-auto-installer');

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      'extension-auto-installer.installGlobalExtensions',
      cmd.installGlobalExtensions
    ),
    commands.registerCommand(
      'extension-auto-installer.installLanguageExtensionsForCurrentBuffer',
      async () => {
        const languageId = (await workspace.document).textDocument.languageId;
        await installLanguageExtensions(
          getConfiguration(),
          languageId,
          false,
          true
        );
      }
    ),
    commands.registerCommand(
      'extension-auto-installer.removeUnusedExtensions',
      async () => await removeUnusedExtensions(getConfiguration(), true)
    ),
    workspace.onDidOpenTextDocument(async (e) => {
      if (config.autoCheckLanguageExtensions !== 'never') {
        await installLanguageExtensions(
          getConfiguration(),
          e.languageId,
          config.autoCheckLanguageExtensions === 'autoInstall',
          false
        );
      }
    })
  );

  const config = getConfiguration();
  channel.appendLine(
    `Extension Manager Configuration: ${JSON.stringify(config, null, 2)}`
  );

  if (config.autoCheckGlobalExtensions !== 'never') {
    await installGlobalExtensions(config, false);
  }

  if (config.autoRemoveUnusedExtensions !== 'never') {
    await removeUnusedExtensions(config, false);
  }
}
