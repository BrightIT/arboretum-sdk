import { findAncestors } from './find-ancestors';
import {
  mockedPage1,
  mockedPage1_1,
  mockedPage1_1_1,
  mockedPage1_2,
  mockedPage2,
  mockedPage3,
  mockedRoot,
  mockedLocalizedSitemap,
} from './__mocks__/mocked-localized-sitemap';

describe(findAncestors, () => {
  test('Get home page ancestors', () => {
    expect(findAncestors(mockedLocalizedSitemap, mockedRoot)).toBeUndefined();
  });

  test('Get first level nodes ancestors', () => {
    expect(findAncestors(mockedLocalizedSitemap, mockedPage1)).toEqual([
      mockedRoot,
    ]);
    expect(findAncestors(mockedLocalizedSitemap, mockedPage2)).toEqual([
      mockedRoot,
    ]);
    expect(findAncestors(mockedLocalizedSitemap, mockedPage3)).toEqual([
      mockedRoot,
    ]);
  });

  test('Get nested nodes ancestors', () => {
    expect(findAncestors(mockedLocalizedSitemap, mockedPage1_1)).toEqual([
      mockedPage1,
      mockedRoot,
    ]);
    expect(findAncestors(mockedLocalizedSitemap, mockedPage1_1_1)).toEqual([
      mockedPage1_1,
      mockedPage1,
      mockedRoot,
    ]);
    expect(findAncestors(mockedLocalizedSitemap, mockedPage1_2)).toEqual([
      mockedPage1,
      mockedRoot,
    ]);
  });
});
