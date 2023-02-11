import {
  commands,
  ExtensionContext,
  extensions,
  window,
  workspace,
} from 'coc.nvim';

const channel = window.createOutputChannel('extension-auto-installer');

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      'extension-auto-installer.installGlobalExtensions',
      async () => await installGlobalExtensions(getConfiguration(), true)
    ),
    commands.registerCommand(
      'extension-auto-installer.installLanguageExtensionsForCurrentBuffer',
      async () => {
        const languageId = (await workspace.document).textDocument.languageId;
        await installLanguageExtensions(getConfiguration(), languageId, true);
      }
    ),
    commands.registerCommand(
      'extension-auto-installer.removeUnusedExtensions',
      async () => await removeUnusedExtensions(getConfiguration(), true)
    ),
    workspace.onDidOpenTextDocument(async (e) => {
      await installLanguageExtensions(
        getConfiguration(),
        e.languageId,
        false
      );
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

async function installGlobalExtensions(
  config: Configuration,
  showMessage: boolean
): Promise<void> {
  const wanted = [...config.globalExtensions, ...config.workspaceExtensions];
  const res = await installExtensionsIfNotInstalled(
    wanted,
    config.autoCheckGlobalExtensions === 'autoInstall'
  );
  switch (res) {
    case 'allInstalled':
      if (showMessage) {
        await window.showInformationMessage(
          'All language extensions are installed.'
        );
      }
      break;
    case 'noExtensionSelected':
      await window.showInformationMessage('No extensions are selected.');
      break;
  }
}

async function installLanguageExtensions(
  config: Configuration,
  languageId: string,
  showMessage: boolean
) {
  const wanted = config.languageExtensions[languageId];
  if (!wanted) {
    if (showMessage) {
      window.showInformationMessage('No language extensions found.');
    }
    return;
  }

  const res = await installExtensionsIfNotInstalled(
    wanted,
    config.autoCheckLanguageExtensions === 'autoInstall'
  );
  switch (res) {
    case 'allInstalled':
      if (showMessage) {
        await window.showInformationMessage(
          'All language extensions are installed.'
        );
      }
      break;
    case 'noExtensionSelected':
      await window.showInformationMessage('No extensions are selected.');
      break;
  }
}

async function installExtensionsIfNotInstalled(
  wanted: string[],
  autoInstall: boolean
): Promise<'success' | 'allInstalled' | 'cancelled' | 'noExtensionSelected'> {
  const installed = new Set(getInstalledExtensions());
  let toInstall: string[] = [];
  for (const extension of wanted) {
    if (!installed.has(extension)) {
      toInstall.push(extension);
    }
  }

  channel.appendLine(`wanted extensions: [${wanted.join(', ')}]`);
  channel.appendLine(`installed extensions: [${[...installed].join(', ')}]`);
  channel.appendLine(`toInstall extensions: [${toInstall.join(', ')}]`);

  // If there is no extensions, nothing to install.
  if (toInstall.length === 0) {
    return 'allInstalled';
  }

  const result = autoInstall
    ? 'Install'
    : await window.showInformationMessage(
        'There are extensions that are not installed. Install?\n' +
          `[${toInstall.join(', ')}]`,
        'Install',
        'Select which extensions to install',
        'Not now'
      );

  if (!result || result === 'Not now') {
    return 'cancelled';
  }

  if (result === 'Select which extensions to install') {
    toInstall =
      (await window.showQuickPick(toInstall, {
        title: 'Select extensions to install',
        canPickMany: true,
      })) || [];
    if (toInstall.length === 0) {
      return 'noExtensionSelected';
    }
  }

  // Install extension now
  // installExtensions is not in type definitions but exists
  await (extensions as any).installExtensions(toInstall);

  return 'success';
}

async function removeUnusedExtensions(
  config: Configuration,
  showMessage: boolean
): Promise<void> {
  const installed = getInstalledExtensions().filter(
    (id) => !(extensions as any).manager.getExtension(id).isLocal
  );
  const specified = new Set([
    ...config.globalExtensions,
    ...config.workspaceExtensions,
    ...([] as string[]).concat(...Object.values(config.languageExtensions)),
  ]);

  let toRemove = installed.filter(
    (extensionId) => !specified.has(extensionId)
  );
  if (toRemove.length === 0) {
    if (showMessage) {
      await window.showInformationMessage('No unused extensions found');
    }
    return;
  } else {
    const autoRemove = config.autoRemoveUnusedExtensions === 'autoRemove';
    const result = autoRemove
      ? 'Remove'
      : await window.showInformationMessage(
          'There are extensions that are not used anymore. Remove?\n' +
            `[${toRemove.join(', ')}]`,
          'Remove',
          'Select which extensions to remove',
          'Not now'
        );

    if (!result || result === 'Not now') return;

    if (result === 'Select which extensions to remove') {
      toRemove =
        (await window.showQuickPick(toRemove, {
          title: 'Select extensions to remove',
          canPickMany: true,
        })) || [];
      if (toRemove.length === 0) {
        return;
      }
    }

    // uninstallExtensions is not in type definitions but exists
    (extensions as any).manager.uninstallExtensions(toRemove);
  }
}

function getInstalledExtensions(): string[] {
  return extensions.all.map((api) => api.id);
}

type Configuration = {
  autoRemoveUnusedExtensions: 'autoRemove' | 'confirm' | 'never';
  autoCheckGlobalExtensions: 'autoInstall' | 'confirm' | 'never';
  autoCheckLanguageExtensions: 'autoInstall' | 'confirm' | 'never';
  globalExtensions: string[];
  workspaceExtensions: string[];
  languageExtensions: Record<string, string[]>;
};

function getConfiguration(): Configuration {
  const config = workspace.getConfiguration('extension-auto-installer');
  return {
    autoRemoveUnusedExtensions: config.get(
      'autoRemoveUnusedExtensions',
      'never'
    ),
    autoCheckGlobalExtensions: config.get(
      'autoCheckGlobalExtensions',
      'confirm'
    ),
    autoCheckLanguageExtensions: config.get(
      'autoCheckLanguageExtensions',
      'confirm'
    ),
    globalExtensions: config.get('globalExtensions', []),
    workspaceExtensions: config.get('workspaceExtensions', []),
    languageExtensions: config.get('languageExtensions', {}),
  };
}
