import { commands, ExtensionContext, workspace } from 'coc.nvim';
import { createContainer } from './containerFactory';
import {
  installGlobalExtensions,
  installLanguageExtensions,
  uninstallUnusedExtensions,
} from './controller/commands';
import { onDidOpenTextDocument } from './controller/events';

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      'extension-auto-installer.installGlobalExtensions',
      installGlobalExtensions
    ),
    commands.registerCommand(
      'extension-auto-installer.installLanguageExtensions',
      installLanguageExtensions
    ),
    commands.registerCommand(
      'extension-auto-installer.uninstallUnusedExtensions',
      uninstallUnusedExtensions
    ),
    workspace.onDidOpenTextDocument(onDidOpenTextDocument)
  );

  const container = createContainer({ silent: true });
  const config = container.configLoader.load();
  container.channel.appendLine(
    `Extension Manager Configuration: ${JSON.stringify(config, null, 2)}`
  );
  container.installExtensionUsecase.handle({
    autoExecution: config.autoInstallGlobal,
  });
  container.uninstallUnusedExtensionUsecase.handle({
    autoExecution: config.autoUninstallUnused,
  });
}
