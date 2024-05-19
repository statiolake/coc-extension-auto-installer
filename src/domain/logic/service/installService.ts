import { extensions, window } from 'coc.nvim';
import { UserPromptInterface } from '../../externalInterface/userPromptInterface';
import { AutoExecution } from '../entity/config';
import { Extension, RequestedExtension } from '../entity/extension';

export async function installLanguageExtensions(
  config: Configuration,
  languageId: string,
  autoInstall: boolean,
  showMessage: boolean
) {
  const wanted = config.languageExtensions[languageId];
  if (!wanted) {
    if (showMessage) {
      window.showInformationMessage('No language extensions found.');
    }
    return;
  }

  const res = await installExtensionsIfNotInstalled(wanted, autoInstall);
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

export const getInstalledExtensions = (): Extension[] => {
  return extensions.all.map((api) => ({ id: api.id }));
};

export const selectTargets = (
  requests: RequestedExtension[],
  installed: Extension[],
  onlyForLanguage?: string
): Extension[] => {
  return requests
    .filter((request) => {
      // Only select non-installed extensions
      return installed.every((extension) => extension.id !== request.id);
    })
    .filter((request) => {
      const languages = request.languages;
      return (
        (onlyForLanguage === undefined && languages.isGlobal) ||
        (onlyForLanguage !== undefined &&
          !languages.isGlobal &&
          languages.names.includes(onlyForLanguage))
      );
    });
};

export const askUserForTargets = async (
  autoExecution: AutoExecution,
  userPrompt: UserPromptInterface,
  targets: Extension[]
): Promise<Extension[]> => {
  if (targets.length === 0) {
    return [];
  }

  if (autoExecution === 'never') {
    return [];
  }

  if (autoExecution === 'auto') {
    return targets;
  }

  const option = await userPrompt.prompt(
    [
      'There are extensions that are not installed. Install?',
      targets.map((extension) => extension.id).join(', '),
    ].join('\n'),
    [
      { id: 'install', label: 'Install' },
      { id: 'select', label: 'Select which extensions to install' },
      { id: 'notNow', label: 'Not now' },
    ]
  );

  if (!option || option.id === 'notNow') {
    return [];
  }

  if (option.id === 'install') {
    return targets;
  }

  const selected = await userPrompt.promptMany(
    'Select extensions to install',
    targets.map((extension) => ({ id: extension.id, label: extension.id }))
  );

  if (!selected) {
    return [];
  }

  return selected.map((selected) => ({ id: selected.id }));
};

export const installExtensions = async (
  extensions: Extension[]
): Promise<void> => {
  // installExtensions is not in type definitions but exists
  await (extensions as any).installExtensions(extensions);
};

export const uninstallExtensions = async (
  extensions: Extension[]
): Promise<void> => {
  // uninstallExtensions is not in type definitions but exists
  (extensions as any).manager.uninstallExtensions(extensions);
};
