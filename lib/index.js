"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(src_exports);
var import_coc = require("coc.nvim");
var channel = import_coc.window.createOutputChannel("extension-auto-installer");
async function activate(context) {
  context.subscriptions.push(
    import_coc.commands.registerCommand(
      "extension-auto-installer.installGlobalExtensions",
      async () => await installGlobalExtensions(getConfiguration(), true)
    ),
    import_coc.commands.registerCommand(
      "extension-auto-installer.installLanguageExtensionsForCurrentBuffer",
      async () => {
        const languageId = (await import_coc.workspace.document).textDocument.languageId;
        await installLanguageExtensions(getConfiguration(), languageId, true);
      }
    ),
    import_coc.commands.registerCommand(
      "extension-auto-installer.removeUnusedExtensions",
      async () => await removeUnusedExtensions(getConfiguration(), true)
    ),
    import_coc.workspace.onDidOpenTextDocument(async (e) => {
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
  if (config.autoCheckGlobalExtensions !== "never") {
    await installGlobalExtensions(config, false);
  }
  if (config.autoRemoveUnusedExtensions !== "never") {
    await removeUnusedExtensions(config, false);
  }
}
async function installGlobalExtensions(config, showMessage) {
  const wanted = [...config.globalExtensions, ...config.workspaceExtensions];
  const res = await installExtensionsIfNotInstalled(
    wanted,
    config.autoCheckGlobalExtensions === "autoInstall"
  );
  switch (res) {
    case "allInstalled":
      if (showMessage) {
        await import_coc.window.showInformationMessage(
          "All language extensions are installed."
        );
      }
      break;
    case "noExtensionSelected":
      await import_coc.window.showInformationMessage("No extensions are selected.");
      break;
  }
}
async function installLanguageExtensions(config, languageId, showMessage) {
  const wanted = config.languageExtensions[languageId];
  if (!wanted) {
    if (showMessage) {
      import_coc.window.showInformationMessage("No language extensions found.");
    }
    return;
  }
  const res = await installExtensionsIfNotInstalled(
    wanted,
    config.autoCheckLanguageExtensions === "autoInstall"
  );
  switch (res) {
    case "allInstalled":
      if (showMessage) {
        await import_coc.window.showInformationMessage(
          "All language extensions are installed."
        );
      }
      break;
    case "noExtensionSelected":
      await import_coc.window.showInformationMessage("No extensions are selected.");
      break;
  }
}
async function installExtensionsIfNotInstalled(wanted, autoInstall) {
  const installed = new Set(getInstalledExtensions());
  let toInstall = [];
  for (const extension of wanted) {
    if (!installed.has(extension)) {
      toInstall.push(extension);
    }
  }
  channel.appendLine(`wanted extensions: [${wanted.join(", ")}]`);
  channel.appendLine(`installed extensions: [${[...installed].join(", ")}]`);
  channel.appendLine(`toInstall extensions: [${toInstall.join(", ")}]`);
  if (toInstall.length === 0) {
    return "allInstalled";
  }
  const result = autoInstall ? "Install" : await import_coc.window.showInformationMessage(
    `There are extensions that are not installed. Install?
[${toInstall.join(", ")}]`,
    "Install",
    "Select which extensions to install",
    "Not now"
  );
  if (!result || result === "Not now") {
    return "cancelled";
  }
  if (result === "Select which extensions to install") {
    toInstall = await import_coc.window.showQuickPick(toInstall, {
      title: "Select extensions to install",
      canPickMany: true
    }) || [];
    if (toInstall.length === 0) {
      return "noExtensionSelected";
    }
  }
  await import_coc.extensions.installExtensions(toInstall);
  return "success";
}
async function removeUnusedExtensions(config, showMessage) {
  const installed = getInstalledExtensions().filter(
    (id) => !import_coc.extensions.manager.getExtension(id).isLocal
  );
  const specified = /* @__PURE__ */ new Set([
    ...config.globalExtensions,
    ...config.workspaceExtensions,
    ...[].concat(...Object.values(config.languageExtensions))
  ]);
  let toRemove = installed.filter(
    (extensionId) => !specified.has(extensionId)
  );
  if (toRemove.length === 0) {
    if (showMessage) {
      await import_coc.window.showInformationMessage("No unused extensions found");
    }
    return;
  } else {
    const autoRemove = config.autoRemoveUnusedExtensions === "autoRemove";
    const result = autoRemove ? "Remove" : await import_coc.window.showInformationMessage(
      `There are extensions that are not used anymore. Remove?
[${toRemove.join(", ")}]`,
      "Remove",
      "Select which extensions to remove",
      "Not now"
    );
    if (!result || result === "Not now")
      return;
    if (result === "Select which extensions to remove") {
      toRemove = await import_coc.window.showQuickPick(toRemove, {
        title: "Select extensions to remove",
        canPickMany: true
      }) || [];
      if (toRemove.length === 0) {
        return;
      }
    }
    import_coc.extensions.manager.uninstallExtensions(toRemove);
  }
}
function getInstalledExtensions() {
  return import_coc.extensions.all.map((api) => api.id);
}
function getConfiguration() {
  const config = import_coc.workspace.getConfiguration("extension-auto-installer");
  return {
    autoRemoveUnusedExtensions: config.get(
      "autoRemoveUnusedExtensions",
      "never"
    ),
    autoCheckGlobalExtensions: config.get(
      "autoCheckGlobalExtensions",
      "confirm"
    ),
    autoCheckLanguageExtensions: config.get(
      "autoCheckLanguageExtensions",
      "confirm"
    ),
    globalExtensions: config.get("globalExtensions", []),
    workspaceExtensions: config.get("workspaceExtensions", []),
    languageExtensions: config.get("languageExtensions", {})
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
