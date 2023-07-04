import { LocaleT } from '../../../clients/contentful-client/contentful-client';
import { localizeField } from './localize-contentful-field';
import { SitemapDataT } from '../../data/sitemap-data';

const enLocale: LocaleT = {
  code: 'en',
  default: true,
  fallbackCode: null,
  name: 'English',
};

const enAtLocale: LocaleT = {
  code: 'en-At',
  default: true,
  fallbackCode: enLocale.code,
  name: 'English',
};

const deLocale: LocaleT = {
  code: 'de',
  default: false,
  fallbackCode: null,
  name: 'German',
};

const deDeLocale: LocaleT = {
  code: 'de-DE',
  default: true,
  fallbackCode: deLocale.code,
  name: 'German',
};

const deAtLocale: LocaleT = {
  code: 'de-AT',
  default: true,
  fallbackCode: deDeLocale.code,
  name: 'German',
};

const esLocale: LocaleT = {
  code: 'es',
  default: true,
  fallbackCode: deDeLocale.code,
  name: 'Spanish',
};

const frLocale: LocaleT = {
  code: 'fr',
  default: false,
  fallbackCode: null,
  name: 'French',
};

const singleEnLocale: Pick<SitemapDataT, 'locales' | 'defaultLocaleCode'> = {
  defaultLocaleCode: enLocale.code,
  locales: new Map([[enLocale.code, enLocale]]),
};

const multipleIndependentLocales: Pick<
  SitemapDataT,
  'locales' | 'defaultLocaleCode'
> = {
  defaultLocaleCode: enLocale.code,
  locales: new Map([
    [enLocale.code, enLocale],
    [esLocale.code, esLocale],
    [frLocale.code, frLocale],
  ]),
};

const multipleLocales: Pick<SitemapDataT, 'locales' | 'defaultLocaleCode'> = {
  defaultLocaleCode: enLocale.code,
  locales: new Map([
    [enLocale.code, enLocale],
    [enAtLocale.code, enAtLocale],
    [deLocale.code, deLocale],
    [deDeLocale.code, deDeLocale],
    [deAtLocale.code, deAtLocale],
    [frLocale.code, frLocale],
  ]),
};

describe(localizeField, () => {
  test('Get value from empty field', () => {
    const valueResult = localizeField(singleEnLocale, enLocale)(false, {});
    expect(valueResult).toBeUndefined();
    const valueEnResult = localizeField(singleEnLocale, enLocale)(true, {});
    expect(valueEnResult).toBeUndefined();
  });
  test('Get value from not localized field', () => {
    const stringValue = 'test';
    const stringValueEnResult = localizeField(singleEnLocale, enLocale)(false, {
      [enLocale.code]: stringValue,
    });
    expect(stringValueEnResult).toEqual(stringValue);

    const stringValueDeResult = localizeField(
      multipleIndependentLocales,
      deLocale,
    )(false, {
      [enLocale.code]: stringValue,
    });
    expect(stringValueDeResult).toEqual(stringValue);
  });

  test('Localize field single locale', () => {
    const stringValue = 'test';
    const stringValueResult = localizeField(singleEnLocale, enLocale)(true, {
      [enLocale.code]: stringValue,
    });
    expect(stringValueResult).toEqual(stringValue);

    const objectValue = { v: stringValue };
    const objectValueResult = localizeField(singleEnLocale, enLocale)(true, {
      [enLocale.code]: objectValue,
    });
    expect(objectValueResult).toMatchObject(objectValue);
  });

  test('Localize field multiple indendent locales', () => {
    const enStringValue = 'enTest';
    const esStringValue = 'esTest';
    const frStringValue = 'frTest';
    const field = {
      [enLocale.code]: enStringValue,
      [esLocale.code]: esStringValue,
      [frLocale.code]: frStringValue,
    };
    const enValueResult = localizeField(multipleIndependentLocales, enLocale)(
      true,
      field,
    );

    expect(enValueResult).toEqual(enStringValue);

    const esValueResult = localizeField(multipleIndependentLocales, esLocale)(
      true,
      field,
    );

    expect(esValueResult).toEqual(esStringValue);

    const frValueResult = localizeField(multipleIndependentLocales, frLocale)(
      true,
      field,
    );

    expect(frValueResult).toEqual(frStringValue);
  });

  test('Localize field multiple locales with fallbacks', () => {
    const enStringValue = 'enTest';
    const deStringValue = 'deTest';
    const field = {
      [enLocale.code]: enStringValue,
      [deLocale.code]: deStringValue,
    };
    const enValueResult = localizeField(multipleLocales, enLocale)(true, field);

    expect(enValueResult).toEqual(enStringValue);

    const deValueResult = localizeField(multipleLocales, deLocale)(true, field);

    expect(deValueResult).toEqual(deStringValue);

    const frValueResult = localizeField(multipleLocales, frLocale)(true, field);

    expect(frValueResult).toBeUndefined();

    const enAtValueResult = localizeField(multipleLocales, enAtLocale)(
      true,
      field,
    );

    expect(enAtValueResult).toEqual(enStringValue);

    const deDeValueResult = localizeField(multipleLocales, deDeLocale)(
      true,
      field,
    );

    expect(deDeValueResult).toEqual(deStringValue);

    const deAtValueResult = localizeField(multipleLocales, deAtLocale)(
      true,
      field,
    );

    expect(deAtValueResult).toEqual(deStringValue);
  });
});
