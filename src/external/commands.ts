export async function installGlobalExtensions() {
  return await installGlobalExtensions(getConfiguration(), true);
}
