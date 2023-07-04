import { EntryT } from '../../../clients/contentful-client/contentful-client';
import { localeCodesFromMetadata } from './locale-codes-from-metadata';

const localeTagIdPrefix = 'locale';
const emptyMetadata: EntryT['metadata'] = { tags: [] };
const nonEmptyMetadata: EntryT['metadata'] = {
  tags: [{ sys: { id: 'someTagId' } }],
};
const nonEmptyMetadataWithValidLocales: EntryT['metadata'] = {
  tags: [
    { sys: { id: 'localeEn' } },
    ...nonEmptyMetadata.tags,
    { sys: { id: 'localeDe' } },
  ],
};

describe(localeCodesFromMetadata, () => {
  test('Locale codes from empty metadata', () => {
    expect(
      localeCodesFromMetadata(localeTagIdPrefix, emptyMetadata).length,
    ).toEqual(0);
  });

  test('Locale codes from metadata (without valid locales)', () => {
    expect(
      localeCodesFromMetadata(localeTagIdPrefix, nonEmptyMetadata).length,
    ).toEqual(0);
  });

  test('Locale codes from metadata (without valid locales)', () => {
    expect(
      localeCodesFromMetadata(localeTagIdPrefix, nonEmptyMetadata).length,
    ).toEqual(0);
  });

  test('Locale codes from metadata (with valid locales)', () => {
    expect(
      localeCodesFromMetadata(
        localeTagIdPrefix,
        nonEmptyMetadataWithValidLocales,
      ),
    ).toEqual(['en', 'de']);
  });
});
