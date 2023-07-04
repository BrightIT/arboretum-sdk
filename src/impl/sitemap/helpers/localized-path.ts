export const localizedPath = (localeCode: string, path?: string): string => {
  const pathLocalePrefix = "/" + localeCode;
  return path ? pathLocalePrefix + path : pathLocalePrefix;
};
