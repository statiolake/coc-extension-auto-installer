import {
  commands,
  ExtensionContext,
  extensions,
  window,
  workspace,
} from 'coc.nvim';

const channel = window.createOutputChannel('extension-manager');

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      'extension-manager.installGlobalExtensions',
      async () => await installGlobalExtensions(getConfiguration(), true)
    ),
    commands.registerCommand(
      'extension-manager.installFileTypeExtensionsForCurrentBuffer',
      async () => {
        const fileType = await workspace.nvim.eval('&filetype');
        if (typeof fileType !== 'string') {
          await window.showErrorMessage('Failed to get buffer file type.');
          return;
        }
        await installFileTypeExtensions(getConfiguration(), fileType, true);
      }
    ),

    workspace.registerAutocmd({
      event: 'FileType',
      request: false,
      arglist: ["expand('<amatch>')"],
      callback: async (fileType: string) => {
        await installFileTypeExtensions(getConfiguration(), fileType, false);
      },
    })
  );

  const config = getConfiguration();
  channel.appendLine(
    `Extension Manager Configuration: ${JSON.stringify(config, null, 2)}`
  );
  await installGlobalExtensions(config, false);
}

async function installGlobalExtensions(
  config: Configuration,
  showMessage: boolean
): Promise<void> {
  const wanted = [...config.globalExtensions, ...config.workspaceExtensions];
  const res = await installExtensionsIfNotInstalled(wanted);
  switch (res) {
    case 'allInstalled':
      if (showMessage) {
        await window.showInformationMessage(
          'All file type extensions are installed.'
        );
      }
      break;
    case 'noExtensionSelected':
      await window.showInformationMessage('No extensions are selected.');
      break;
  }
}

async function installFileTypeExtensions(
  config: Configuration,
  fileType: string,
  showMessage: boolean
) {
  const wanted = config.filetypeExtensions[fileType];
  if (!wanted) {
    if (showMessage) {
      window.showInformationMessage('No file type extensions found.');
    }
    return;
  }

  const res = await installExtensionsIfNotInstalled(wanted);
  switch (res) {
    case 'allInstalled':
      if (showMessage) {
        await window.showInformationMessage(
          'All file type extensions are installed.'
        );
      }
      break;
    case 'noExtensionSelected':
      await window.showInformationMessage('No extensions are selected.');
      break;
  }
}

async function installExtensionsIfNotInstalled(
  wanted: string[]
): Promise<'success' | 'allInstalled' | 'cancelled' | 'noExtensionSelected'> {
  const installed: { [K: string]: boolean } = Object.assign(
    {},
    ...extensions.all.map((api) => ({ [api.id]: true }))
  );

  let toInstall: string[] = [];
  for (const extension of wanted) {
    if (!installed[extension]) {
      toInstall.push(extension);
    }
  }

  channel.appendLine(`wanted extensions: [${wanted.join(', ')}]`);
  channel.appendLine(
    `installed extensions: [${Object.keys(installed).join(', ')}]`
  );
  channel.appendLine(`toInstall extensions: [${toInstall.join(', ')}]`);

  // If there is no extensions, nothing to install.
  if (toInstall.length === 0) {
    return 'allInstalled';
  }

  const result = await window.showInformationMessage(
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

type Configuration = {
  globalExtensions: string[];
  workspaceExtensions: string[];
  filetypeExtensions: Record<string, string[]>;
};

function getConfiguration(): Configuration {
  const config = workspace.getConfiguration('extension-manager');
  return {
    globalExtensions: config.get('globalExtensions') || [],
    workspaceExtensions: config.get('workspaceExtensions') || [],
    filetypeExtensions: config.get('filetypeExtensions') || {},
  };
}
