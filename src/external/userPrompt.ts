import { window } from 'coc.nvim';
import { UserPromptInterface } from '../domain/externalInterface/userPromptInterface';

export const createUserPrompt = (opts: {
  silent?: boolean;
}): UserPromptInterface => {
  return {
    show: async (message) => {
      if (!opts.silent) {
        window.showInformationMessage(message);
      }
    },
    prompt: async (message, options) => {
      const selected = await window.showQuickPick(
        options.map((option) => option.label),
        { title: message }
      );

      if (!selected) return undefined;
      return options.find((option) => option.label === selected);
    },
    promptMany: async (message, options) => {
      const selected = await window.showQuickPick(
        options.map((option) => option.label),
        { title: message, canPickMany: true }
      );

      if (!selected) return undefined;
      return options.filter((option) => selected.includes(option.label));
    },
  };
};
