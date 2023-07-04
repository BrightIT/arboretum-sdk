export const parseLocaleTag =
  (localeTagIdPrefix: string) =>
  (tagId: string): { localeCode: string } | undefined => {
    if (tagId.startsWith(localeTagIdPrefix)) {
      const codes = tagId
        .substring(localeTagIdPrefix.length, tagId.length)
        .split(/(?=[A-Z])/)
        .flatMap(code => (code ? [code] : []));
      if (codes.length === 1) {
        return { localeCode: codes[0].toLowerCase() };
      } else if (codes.length === 2) {
        return {
          localeCode: `${codes[0].toLowerCase()}-${codes[1].toUpperCase()}`,
        };
      } else {
        return;
      }
    } else {
      return;
    }
  };
