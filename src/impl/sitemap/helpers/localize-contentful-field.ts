import { LocaleCodeT } from '../../arboretum-client.impl';
import { LocaleT } from '../../../clients/contentful-client/contentful-client';
import { SitemapDataT } from '../../data/sitemap-data';

const localizedValue: <T>(
  locales: Map<LocaleCodeT, LocaleT>,
  locale: LocaleT,
  field: Record<string, T>,
) => T | undefined = (localesMap, locale, field) => {
  const maybeFieldValue = field[locale.code];
  if (maybeFieldValue) {
    return maybeFieldValue;
  } else {
    const maybeFallbackLocale = locale.fallbackCode
      ? localesMap.get(locale.fallbackCode)
      : undefined;
    return maybeFallbackLocale
      ? localizedValue(localesMap, maybeFallbackLocale, field)
      : undefined;
  }
};

export const localizeField =
  (
    {
      defaultLocaleCode,
      locales,
    }: Pick<SitemapDataT, 'locales' | 'defaultLocaleCode'>,
    locale: LocaleT,
  ) =>
  <T>(
    isFieldLocalized: boolean,
    field: Record<LocaleCodeT, T | null | undefined>,
  ): T | null | undefined => {
    return isFieldLocalized
      ? localizedValue(locales, locale, field || {})
      : field?.[defaultLocaleCode];
  };
