import { EntryT } from '../../../clients/contentful-client/contentful-client';
import { right } from '../../../utils/fp-utils';
import { jsonStrigifyMapReplacer } from '../../../utils/json-stringify-map-replacer';
import {
  ArboretumClientCtx,
  PageT,
  RedirectT,
} from '../../arboretum-client.impl';
import { buildLocalizedSitemap } from './build-localized-sitemap';
import {
  mockedPages,
  mockedCircularReferencesPages,
  mockedPage1WithCircularReference,
  mockedRoot,
  mockedLocalizedSitemap,
} from './__mocks__/mocked-localized-sitemap';

const defaultLocale = {
  code: 'en',
  default: true,
  fallbackCode: null,
  name: 'English',
};

const pageContentTypeId = 'page';
const pageContentTypeSlugFieldId = 'slug';
const pageContentTypeChildPagesFieldId = 'childPages';

const redirectContentTypeId = 'redirect';
const redirectContentTypePage = 'page';
const redirectContentTypePath = 'path';
const redirectContentTypeType = 'type';

const contentTypes = new Map([
  [
    pageContentTypeId,
    {
      sys: { id: pageContentTypeId },
      fields: new Map([
        [
          pageContentTypeSlugFieldId,
          {
            id: pageContentTypeSlugFieldId,
            localized: true,
            name: 'Slug',
            type: "Symbol"
          },
        ],
        [
          pageContentTypeChildPagesFieldId,
          {
            id: pageContentTypeChildPagesFieldId,
            localized: true,
            name: 'Child Pages',
            type: "Array"
          },
        ],
      ]),
    },
  ],
  [
    redirectContentTypeId,
    {
      sys: { id: redirectContentTypeId },
      fields: new Map([
        [
          redirectContentTypePage,
          {
            id: redirectContentTypePage,
            localized: true,
            name: 'Page',
            type: "Link"
          },
        ],
        [
          redirectContentTypePath,
          {
            id: redirectContentTypePath,
            localized: true,
            name: 'Path',
            type: "Symbol"
          },
        ],
        [
          redirectContentTypeType,
          {
            id: redirectContentTypeType,
            localized: true,
            name: 'Type',
            type: "Symbol"
          },
        ],
      ]),
    },
  ],
]);

const options: ArboretumClientCtx['options'] = {
  pageContentTypes: {
    [pageContentTypeId]: {
      slugFieldId: pageContentTypeSlugFieldId,
      childPagesFieldId: pageContentTypeChildPagesFieldId,
    },
  },
  redirectContentType: {
    id: redirectContentTypeId,
    pageFieldId: redirectContentTypePage,
    pathFieldId: redirectContentTypePath,
    typeFieldId: redirectContentTypeType,
  },
};
const pageToEntry = (page: PageT, tagsIds?: Array<string>): EntryT => ({
  sys: { id: page.sys.id, contentType: { sys: { id: pageContentTypeId } } },
  metadata: tagsIds
    ? { tags: tagsIds.map(t => ({ sys: { id: t } })) }
    : undefined,
  fields: {
    [pageContentTypeSlugFieldId]: { [defaultLocale.code]: page.slug },
    [pageContentTypeChildPagesFieldId]: {
      [defaultLocale.code]: page.childPages.map(cp => ({ sys: cp.sys })),
    },
  },
});

const redirectToEntry = (page: RedirectT, tagsIds?: Array<string>): EntryT => ({
  sys: { id: page.sys.id, contentType: { sys: { id: redirectContentTypeId } } },
  metadata: tagsIds
    ? { tags: tagsIds.map(t => ({ sys: { id: t } })) }
    : undefined,
  fields: {
    [redirectContentTypePage]: {
      [defaultLocale.code]: { sys: { id: page.page.sys.id } },
    },
    [redirectContentTypePath]: {
      [defaultLocale.code]: page.path.slice(("/" + defaultLocale.code).length),
    },
    [redirectContentTypeType]: {
      [defaultLocale.code]: page.type,
    },
  },
});

describe(buildLocalizedSitemap, () => {
  test('Not enough data to build sitemap', () => {
    const emptyData: Pick<
      ArboretumClientCtx['data'],
      | 'homePagesByTagId'
      | 'pages'
      | 'contentTypes'
      | 'defaultLocaleCode'
      | 'locales'
      | 'redirects'
    > = {
      contentTypes,
      defaultLocaleCode: defaultLocale.code,
      locales: new Map([[defaultLocale.code, defaultLocale]]),
      homePagesByTagId: new Map(),
      pages: new Map(),
      redirects: [],
    };
    expect(
      buildLocalizedSitemap(
        emptyData,
        { pageContentTypes: {} },
        'pageHome',
        defaultLocale,
      )._tag,
    ).toBe('Left');
  });

  test('Build localized sitemap', () => {
    const pageHomeTagId: ArboretumClientCtx['pageHomeTagId'] = 'pagHome';

    const pagesEntries = mockedPages.flatMap(page =>
      page.type === 'page'
        ? [pageToEntry(page, page.sys.id === 'root' ? [pageHomeTagId] : [])]
        : [],
    );

    const redirectsEntries = mockedPages.flatMap(page =>
      page.type !== 'page' ? [redirectToEntry(page)] : [],
    );

    const data: Pick<
      ArboretumClientCtx['data'],
      | 'homePagesByTagId'
      | 'pages'
      | 'contentTypes'
      | 'defaultLocaleCode'
      | 'locales'
      | 'redirects'
    > = {
      contentTypes,
      defaultLocaleCode: defaultLocale.code,
      locales: new Map([[defaultLocale.code, defaultLocale]]),
      homePagesByTagId: new Map([
        [
          defaultLocale.code,
          new Map([[pageHomeTagId, [{ sys: { id: mockedRoot.sys.id } }]]]),
        ],
      ]),
      pages: new Map(pagesEntries.map(e => [e.sys.id, e])),
      redirects: redirectsEntries,
    };

    expect(
      JSON.parse(
        JSON.stringify(
          buildLocalizedSitemap(data, options, pageHomeTagId, defaultLocale),
          jsonStrigifyMapReplacer,
        ),
      ),
    ).toMatchObject(
      JSON.parse(
        JSON.stringify(right(mockedLocalizedSitemap), jsonStrigifyMapReplacer),
      ),
    );
  });

  test('Handle reference cycles', () => {
    const pageHomeTagId: ArboretumClientCtx['pageHomeTagId'] = 'pagHome';

    const entries = mockedCircularReferencesPages.map(page =>
      pageToEntry(page, page.sys.id === 'root' ? [pageHomeTagId] : []),
    );

    const data: Pick<
      ArboretumClientCtx['data'],
      | 'homePagesByTagId'
      | 'pages'
      | 'contentTypes'
      | 'defaultLocaleCode'
      | 'locales'
      | 'redirects'
    > = {
      contentTypes,
      defaultLocaleCode: defaultLocale.code,
      locales: new Map([[defaultLocale.code, defaultLocale]]),
      homePagesByTagId: new Map([
        [
          defaultLocale.code,
          new Map([[pageHomeTagId, [{ sys: { id: mockedRoot.sys.id } }]]]),
        ],
      ]),
      pages: new Map(entries.map(e => [e.sys.id, e])),
      redirects: [],
    };

    const expectedLocalizedSitemap = right({
      root: { sys: mockedRoot.sys },
      sitemap: new Map(
        [
          {
            ...mockedRoot,
            childPages: [
              { sys: { id: mockedPage1WithCircularReference.sys.id } },
            ],
          },
          { ...mockedPage1WithCircularReference, childPages: [] },
        ].map(page => [page.sys.id, page]),
      ),
    });

    expect(
      JSON.parse(
        JSON.stringify(
          buildLocalizedSitemap(data, options, pageHomeTagId, defaultLocale),
          jsonStrigifyMapReplacer,
        ),
      ),
    ).toMatchObject(
      JSON.parse(
        JSON.stringify(expectedLocalizedSitemap, jsonStrigifyMapReplacer),
      ),
    );
  });
});
