import { ArboretumPageT, OptionsT } from '../../../arboretum-client';
import {
  mockedPage1,
  mockedPage1_1,
  mockedPage1_1_1,
  mockedPage1_1_2,
  mockedRoot,
  mockedLocalizedSitemap,
} from '../helpers/__mocks__/mocked-localized-sitemap';
import { toArboretumPage } from './to-arboretum-page-adapter';

const localeCode = 'en';

const contentTypeId = "page";

const toArboretumPageF = (options?: OptionsT) =>
  toArboretumPage(mockedLocalizedSitemap, localeCode, options);

const arboretumPageRoot: ArboretumPageT = {
  type: 'page',
  contentTypeId,
  id: mockedRoot.sys.id,
  localeCode,
  path: mockedRoot.path,
  slug: mockedRoot.slug,
  totalDirectChildrenCount: mockedRoot.childPages.length,
};

const arboretumPagePage1: ArboretumPageT = {
  id: mockedPage1.sys.id,
  contentTypeId,
  localeCode,
  path: mockedPage1.path,
  slug: mockedPage1.slug,
  totalDirectChildrenCount: mockedPage1.childPages.length,
  type: 'page',
};

const arboretumPagePage1_1: ArboretumPageT = {
  id: mockedPage1_1.sys.id,
  contentTypeId,
  localeCode,
  path: mockedPage1_1.path,
  slug: mockedPage1_1.slug,
  totalDirectChildrenCount: mockedPage1_1.childPages.length,
  type: 'page',
};

const arboretumPage1_1_1: ArboretumPageT = {
  id: mockedPage1_1_1.sys.id,
  contentTypeId,
  localeCode,
  path: mockedPage1_1_1.path,
  slug: mockedPage1_1_1.slug,
  totalDirectChildrenCount: mockedPage1_1_1.childPages.length,
  type: 'page',
};

const arboretumPage1_1_2: ArboretumPageT = {
  id: mockedPage1_1_2.sys.id,
  contentTypeId,
  localeCode,
  path: mockedPage1_1_2.path,
  slug: mockedPage1_1_2.slug,
  totalDirectChildrenCount: mockedPage1_1_2.childPages.length,
  type: 'page',
};

describe(toArboretumPage, () => {
  test('Transform root to arboretum page', () => {
    mockedLocalizedSitemap;

    expect(toArboretumPageF()(mockedRoot)).toMatchObject(arboretumPageRoot);
  });

  test('Transform nested pages to arboretum page', () => {
    expect(toArboretumPageF()(mockedPage1_1)).toMatchObject(
      arboretumPagePage1_1,
    );

    expect(toArboretumPageF()(mockedPage1_1_1)).toMatchObject(
      arboretumPage1_1_1,
    );
  });

  test('Transform pages with optional parameters to arboretum page', () => {
    const arboretumPage1_1WithAncestors: ArboretumPageT = {
      ...arboretumPagePage1_1,
      ancestors: [arboretumPagePage1, arboretumPageRoot],
      children: [arboretumPage1_1_1, arboretumPage1_1_2],
    };

    expect(
      toArboretumPageF({ withAncestors: true, withChildren: true })(
        mockedPage1_1,
      ),
    ).toMatchObject(arboretumPage1_1WithAncestors);

    const arboretumPage1_1_1WithAncestors: ArboretumPageT = {
      ...arboretumPage1_1_1,
      ancestors: [
        arboretumPagePage1_1,
        ...(arboretumPage1_1WithAncestors.ancestors || []),
      ],
      children: [],
    };

    expect(
      toArboretumPageF({ withAncestors: true, withChildren: true })(
        mockedPage1_1_1,
      ),
    ).toMatchObject(arboretumPage1_1_1WithAncestors);
  });
});
