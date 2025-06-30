import { commands, ExtensionContext, workspace, window } from 'coc.nvim';
import { ExtensionManager } from './extensionManager';
import { loadConfig } from './config';

const channel = window.createOutputChannel('extension-auto-installer');
const extensionManager = new ExtensionManager({ silent: true });

export async function activate(context: ExtensionContext): Promise<void> {
  // Register commands
  context.subscriptions.push(
    commands.registerCommand(
      'extension-auto-installer.installGlobalExtensions',
      async () => {
        await extensionManager.handleInstallExtensions({
          autoExecution: 'confirm',
        });
      }
    ),
    commands.registerCommand(
      'extension-auto-installer.installLanguageExtensions',
      async () => {
        await extensionManager.handleInstallExtensions({
          autoExecution: 'confirm',
        });
      }
    ),
    commands.registerCommand(
      'extension-auto-installer.uninstallUnusedExtensions',
      async () => {
        await extensionManager.handleUninstallUnusedExtensions({
          autoExecution: 'confirm',
        });
      }
    ),
    workspace.onDidOpenTextDocument(async (document) => {
      const config = loadConfig();
      const languageId = document.languageId;

      // Check if there are language-specific extensions for this file type
      if (config.languageExtensions[languageId]) {
        await extensionManager.handleInstallExtensions({
          autoExecution: config.autoInstallLanguage,
          language: languageId,
        });
      }
    })
  );

  // Initialize on startup
  const config = loadConfig();
  channel.appendLine(
    `Extension Manager Configuration: ${JSON.stringify(config, null, 2)}`
  );

  // Auto-install global extensions
  await extensionManager.handleInstallExtensions({
    autoExecution: config.autoInstallGlobal,
  });

  // Auto-uninstall unused extensions
  await extensionManager.handleUninstallUnusedExtensions({
    autoExecution: config.autoUninstallUnused,
  });
}
