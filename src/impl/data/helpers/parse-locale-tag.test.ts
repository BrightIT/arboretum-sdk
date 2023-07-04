import { parseLocaleTag } from './parse-locale-tag';

const localeTagIdPrefix = 'locale';

const parseTag = parseLocaleTag(localeTagIdPrefix);

describe(parseLocaleTag, () => {
  test('Invalid locale tag is handled properly', () => {
    expect(parseTag('locale')?.localeCode).toBeUndefined();
    expect(parseTag('test')?.localeCode).toBeUndefined();
    expect(parseTag('localeEnAtEn')?.localeCode).toBeUndefined();
  });
  test('Locale country tag is parsed properly', () => {
    expect(parseTag('localeEn')?.localeCode).toBe('en');
  });
  test('Locale language-country tag is parsed properly', () => {
    expect(parseTag('localeEnAt')?.localeCode).toBe('en-AT');
  });
});
