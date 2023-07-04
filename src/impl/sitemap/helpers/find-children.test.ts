import { findChildren } from './find-children';
import {
  mockedPage1,
  mockedPage1_1,
  mockedPage1_1_1,
  mockedPage1_1_2,
  mockedPage2,
  mockedPage3,
  mockedRedirects,
  mockedRoot,
  mockedLocalizedSitemap,
} from './__mocks__/mocked-localized-sitemap';

describe(findChildren, () => {
  test('Home page children with redirects', () => {
    expect(findChildren(mockedLocalizedSitemap.sitemap)(mockedRoot)).toEqual([
      mockedPage1,
      mockedPage2,
      mockedPage3,
      ...mockedRedirects,
    ]);
  });

  test('Nested page children', () => {
    expect(findChildren(mockedLocalizedSitemap.sitemap)(mockedPage1_1)).toEqual(
      [mockedPage1_1_1, mockedPage1_1_2],
    );
  });
});
