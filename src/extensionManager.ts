import { extensions, Mutex, window, workspace } from 'coc.nvim';
import { loadConfig } from './config';
import {
  ActionResult,
  AutoExecution,
  Config,
  Extension,
  ExtensionRequest,
} from './types';

export class ExtensionManager {
  private mutex = new Mutex();
  private silent: boolean;

  constructor(options: { silent?: boolean } = {}) {
    this.silent = options.silent ?? false;
  }

  // Get all installed extensions
  getInstalledExtensions(): Extension[] {
    return extensions.all.map((api) => ({
      id: api.id,
      isRuntimePathPlugin:
        !api.extensionPath.includes('coc/extensions') &&
        !api.extensionPath.includes('coc\\extensions'),
    }));
  }

  // Install extensions with mutex protection
  async installExtensions(targets: Extension[]): Promise<void> {
    return await this.mutex.use(async () => {
      // Re-check installed extensions inside mutex to avoid race conditions
      const currentlyInstalled = this.getInstalledExtensions();
      const stillNeedInstall = targets.filter((target) =>
        currentlyInstalled.every((installed) => installed.id !== target.id)
      );

      if (stillNeedInstall.length === 0) {
        return; // Nothing to install anymore
      }

      await (extensions as any).installExtensions(
        stillNeedInstall.map((e) => e.id)
      );

      // Wait a bit to show results to the user
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.closeUI();
    });
  }

  // Uninstall extensions with mutex protection
  async uninstallExtensions(targets: Extension[]): Promise<void> {
    return await this.mutex.use(async () => {
      // Re-check installed extensions inside mutex to avoid race conditions
      const currentlyInstalled = this.getInstalledExtensions();
      const stillNeedUninstall = targets.filter((target) =>
        currentlyInstalled.some((installed) => installed.id === target.id)
      );

      if (stillNeedUninstall.length === 0) {
        return; // Nothing to uninstall anymore
      }

      await (extensions as any).manager.uninstallExtensions(
        stillNeedUninstall.map((e) => e.id)
      );
    });
  }

  // Show user notification
  private async showMessage(message: string): Promise<void> {
    if (!this.silent) {
      window.showInformationMessage(message);
    }
  }

  private async closeUI(): Promise<void> {
    // Close Installation Window
    const nvim = workspace.nvim;
    const winIds = await nvim.call('nvim_list_wins');
    for (const winId of winIds) {
      try {
        const bufId = await nvim.call('nvim_win_get_buf', [winId]);
        const lines = await nvim.call('nvim_buf_get_lines', [
          bufId,
          0,
          1,
          false,
        ]);

        // Check if the buffer contains the installation message
        if (lines.length === 0 || !lines[0].trim().startsWith('Install')) {
          continue;
        }

        // Check if the buffer has a mapping for quitting
        const mappings = await nvim.call('nvim_buf_get_keymap', [bufId, 'n']);
        const hasQuitMapping = mappings.some(
          (mapping: any) => mapping.lhs === 'q' && mapping.rhs.includes(':q')
        );

        if (!hasQuitMapping) {
          continue;
        }

        // Maybe it's the installer UI
        await nvim.call('nvim_win_close', [winId, true]);
      } catch (error) {
        continue;
      }
    }
  }

  // Prompt user with options
  private async promptUser(
    message: string,
    options: Array<{ id: string; label: string }>
  ): Promise<{ id: string; label: string } | undefined> {
    const selected = await window.showInformationMessage(
      message,
      ...options.map((option) => option.label)
    );

    if (!selected) return undefined;
    return options.find((option) => option.label === selected);
  }

  // Prompt user for multiple selections
  private async promptUserMultiple(
    message: string,
    options: Array<{ id: string; label: string }>
  ): Promise<Array<{ id: string; label: string }> | undefined> {
    const selected = await window.showQuickPick(
      options.map((option) => option.label),
      { title: message, canPickMany: true }
    );

    if (!selected) return undefined;
    return options.filter((option) => selected.includes(option.label));
  }

  // Convert config to extension requests
  private getRequestedExtensions(config: Config): ExtensionRequest[] {
    const requests: ExtensionRequest[] = [];

    // Add global extensions
    for (const id of [
      ...config.globalExtensions,
      ...config.workspaceExtensions,
    ]) {
      requests.push({ id, scope: 'global' });
    }

    // Add language-specific extensions
    for (const [language, extensionIds] of Object.entries(
      config.languageExtensions
    )) {
      for (const id of extensionIds) {
        const existing = requests.find((req) => req.id === id);
        if (existing && existing.scope !== 'global') {
          if (Array.isArray(existing.scope)) {
            existing.scope.push(language);
          }
        } else if (!existing) {
          requests.push({ id, scope: [language] });
        }
      }
    }

    return requests;
  }

  // Find extensions that need to be installed
  private findMissingExtensions(
    requests: ExtensionRequest[],
    installed: Extension[],
    onlyForLanguage?: string
  ): Extension[] {
    return requests
      .filter((request) => {
        // Only select non-installed extensions
        return installed.every((extension) => extension.id !== request.id);
      })
      .filter((request) => {
        if (onlyForLanguage === undefined) {
          // Global mode: only global extensions
          return request.scope === 'global';
        }

        // Language mode: only for specific language
        return (
          Array.isArray(request.scope) &&
          request.scope.includes(onlyForLanguage)
        );
      })
      .map((request) => ({ id: request.id, isRuntimePathPlugin: false }));
  }

  // Find extensions that are no longer needed
  private findUnusedExtensions(
    requests: ExtensionRequest[],
    installed: Extension[]
  ): Extension[] {
    return installed
      .filter((extension) => !extension.isRuntimePathPlugin)
      .filter((extension) => {
        return requests.every((request) => request.id !== extension.id);
      });
  }

  // Ask user what to do with a list of extensions
  private async askUser(
    autoExecution: AutoExecution,
    targets: Extension[],
    action: 'install' | 'uninstall'
  ): Promise<Extension[]> {
    if (targets.length === 0) {
      return [];
    }

    if (autoExecution === 'never') {
      return [];
    }

    if (autoExecution === 'auto') {
      return targets;
    }

    const actionText = action === 'install' ? 'Install' : 'Uninstall';
    const questionText =
      action === 'install'
        ? 'There are extensions that are not installed. Install?'
        : 'There are extensions that are no longer needed. Uninstall?';

    const option = await this.promptUser(
      [
        questionText,
        targets.map((extension) => extension.id).join(', '),
      ].join('\n'),
      [
        { id: action, label: actionText },
        {
          id: 'select',
          label: `Select which extensions to ${action.toLowerCase()}`,
        },
        { id: 'notNow', label: 'Not now' },
      ]
    );

    if (!option || option.id === 'notNow') {
      return [];
    }

    if (option.id === action) {
      return targets;
    }

    const selected = await this.promptUserMultiple(
      `Select extensions to ${action.toLowerCase()}`,
      targets.map((extension) => ({
        id: extension.id,
        label: extension.id,
      }))
    );

    if (!selected) {
      return [];
    }

    return selected.map((selected) => ({
      id: selected.id,
      isRuntimePathPlugin: false,
    }));
  }

  // Install extensions use case
  async handleInstallExtensions(options: {
    autoExecution: AutoExecution;
    language?: string;
  }): Promise<ActionResult> {
    const config = loadConfig();
    const requests = this.getRequestedExtensions(config);
    const installed = this.getInstalledExtensions();
    const targets = this.findMissingExtensions(
      requests,
      installed,
      options.language
    );

    if (targets.length === 0) {
      return 'alreadyInstalled';
    }

    const selection = await this.askUser(
      options.autoExecution,
      targets,
      'install'
    );

    if (selection.length === 0) {
      return 'cancelled';
    }

    await this.installExtensions(selection);
    return 'success';
  }

  // Uninstall unused extensions use case
  async handleUninstallUnusedExtensions(options: {
    autoExecution: AutoExecution;
  }): Promise<ActionResult> {
    const config = loadConfig();
    const requests = this.getRequestedExtensions(config);
    const installed = this.getInstalledExtensions();
    const targets = this.findUnusedExtensions(requests, installed);

    if (targets.length === 0) {
      return 'alreadyInstalled';
    }

    const selection = await this.askUser(
      options.autoExecution,
      targets,
      'uninstall'
    );

    if (selection.length === 0) {
      return 'cancelled';
    }

    await this.uninstallExtensions(selection);
    return 'success';
  }
}
