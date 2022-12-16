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
      "extension-auto-installer.installFileTypeExtensionsForCurrentBuffer",
      async () => {
        const fileType = await import_coc.workspace.nvim.eval("&filetype");
        if (typeof fileType !== "string") {
          await import_coc.window.showErrorMessage("Failed to get buffer file type.");
          return;
        }
        await installFileTypeExtensions(getConfiguration(), fileType, true);
      }
    ),
    import_coc.workspace.registerAutocmd({
      event: "FileType",
      request: false,
      arglist: ["expand('<amatch>')"],
      callback: async (fileType) => {
        await installFileTypeExtensions(getConfiguration(), fileType, false);
      }
    })
  );
  const config = getConfiguration();
  channel.appendLine(
    `Extension Manager Configuration: ${JSON.stringify(config, null, 2)}`
  );
  await installGlobalExtensions(config, false);
}
async function installGlobalExtensions(config, showMessage) {
  const wanted = [...config.globalExtensions, ...config.workspaceExtensions];
  const res = await installExtensionsIfNotInstalled(wanted);
  switch (res) {
    case "allInstalled":
      if (showMessage) {
        await import_coc.window.showInformationMessage(
          "All file type extensions are installed."
        );
      }
      break;
    case "noExtensionSelected":
      await import_coc.window.showInformationMessage("No extensions are selected.");
      break;
  }
}
async function installFileTypeExtensions(config, fileType, showMessage) {
  const wanted = config.filetypeExtensions[fileType];
  if (!wanted) {
    if (showMessage) {
      import_coc.window.showInformationMessage("No file type extensions found.");
    }
    return;
  }
  const res = await installExtensionsIfNotInstalled(wanted);
  switch (res) {
    case "allInstalled":
      if (showMessage) {
        await import_coc.window.showInformationMessage(
          "All file type extensions are installed."
        );
      }
      break;
    case "noExtensionSelected":
      await import_coc.window.showInformationMessage("No extensions are selected.");
      break;
  }
}
async function installExtensionsIfNotInstalled(wanted) {
  const installed = Object.assign(
    {},
    ...import_coc.extensions.all.map((api) => ({ [api.id]: true }))
  );
  let toInstall = [];
  for (const extension of wanted) {
    if (!installed[extension]) {
      toInstall.push(extension);
    }
  }
  channel.appendLine(`wanted extensions: [${wanted.join(", ")}]`);
  channel.appendLine(
    `installed extensions: [${Object.keys(installed).join(", ")}]`
  );
  channel.appendLine(`toInstall extensions: [${toInstall.join(", ")}]`);
  if (toInstall.length === 0) {
    return "allInstalled";
  }
  const result = await import_coc.window.showInformationMessage(
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
function getConfiguration() {
  const config = import_coc.workspace.getConfiguration("extension-auto-installer");
  return {
    globalExtensions: config.get("globalExtensions") || [],
    workspaceExtensions: config.get("workspaceExtensions") || [],
    filetypeExtensions: config.get("filetypeExtensions") || {}
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
