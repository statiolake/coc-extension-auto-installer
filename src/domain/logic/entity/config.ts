import { z } from 'zod';

export const ConfigSchema = z.object({
  autoRemoveUnusedExtensions: z
    .union([
      z.literal('autoRemove'),
      z.literal('confirm'),
      z.literal('never'),
    ])
    .default('never'),
  autoCheckGlobalExtensions: z
    .union([
      z.literal('autoInstall'),
      z.literal('confirm'),
      z.literal('never'),
    ])
    .default('confirm'),
  autoCheckLanguageExtensions: z
    .union([
      z.literal('autoInstall'),
      z.literal('confirm'),
      z.literal('never'),
    ])
    .default('confirm'),
  globalExtensions: z.array(z.string()).default([]),
  workspaceExtensions: z.array(z.string()).default([]),
  languageExtensions: z.record(z.array(z.string())).default({}),
});

export type Config = z.infer<typeof ConfigSchema>;
