import { z } from 'zod';

// Configuration types
export const AutoExecutionSchema = z.union([
  z.literal('auto'),
  z.literal('confirm'),
  z.literal('never'),
]);

export const ConfigSchema = z.object({
  autoUninstallUnused: AutoExecutionSchema.default('never'),
  autoInstallGlobal: AutoExecutionSchema.default('confirm'),
  autoInstallLanguage: AutoExecutionSchema.default('confirm'),
  globalExtensions: z.array(z.string()).default([]),
  workspaceExtensions: z.array(z.string()).default([]),
  languageExtensions: z.record(z.array(z.string())).default({}),
});

export type AutoExecution = z.infer<typeof AutoExecutionSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Extension types
export type Extension = {
  id: string;
  isRuntimePathPlugin: boolean;
};

export type ExtensionRequest = {
  id: string;
  scope: 'global' | string[];
};

// Action result types
export type ActionResult = 'success' | 'alreadyInstalled' | 'cancelled';
