import { z } from 'zod';

export const AutoExecutionSchema = z.union([
  z.literal('auto'),
  z.literal('confirm'),
  z.literal('never'),
]);

export const ConfigSchema = z.object({
  autoUninstallUnused: AutoExecutionSchema.default('never'),
  autoGlobalInstall: AutoExecutionSchema.default('confirm'),
  autoLanguageInstall: AutoExecutionSchema.default('confirm'),
  globalExtensions: z.array(z.string()).default([]),
  workspaceExtensions: z.array(z.string()).default([]),
  languageExtensions: z.record(z.array(z.string())).default({}),
});

export type AutoExecution = z.infer<typeof AutoExecutionSchema>;
export type Config = z.infer<typeof ConfigSchema>;
