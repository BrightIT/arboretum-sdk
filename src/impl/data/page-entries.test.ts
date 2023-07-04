import { ArboretumClientContentfulConfigOptionsT } from '../../arboretum-client';
import {
  mockedEntrySysId,
  multipleContentTypesMockedContentfulEntriesClientApi,
} from './helpers/__mocks__/mocked-contentful-entries-client-api';
import { pageEntries } from './page-entries';


const productTypesOptions = (
  productTypesIds: Array<string>,
): ArboretumClientContentfulConfigOptionsT['pageContentTypes'] => {
  const seed: ArboretumClientContentfulConfigOptionsT['pageContentTypes'] = {};
  return productTypesIds.reduce((acc, ct) => {
    acc[ct] = {
      slugFieldId: 'slug',
    };
    return acc;
  }, seed);
};

describe(pageEntries, () => {
  test('Handle case where there are no page entries', async () => {
    const singleTestPageContentType = ['page1ContentType'];
    const testPageContentTypes = [
      ...singleTestPageContentType,
      'page2ContentType',
    ];

    const entries1 = await pageEntries(
      {
        contentfulClientType: 'cda-client',
        options: {
          pageContentTypes: productTypesOptions(singleTestPageContentType),
        },
        preview: false,
      },
      multipleContentTypesMockedContentfulEntriesClientApi(
        singleTestPageContentType.map(contentType => ({
          contentType,
          total: 0,
        })),
      ),
    );
    expect(entries1.size).toBe(0);

    const entries2 = await pageEntries(
      {
        contentfulClientType: 'cda-client',
        options: {
          pageContentTypes: productTypesOptions(testPageContentTypes),
        },
        preview: false,
      },
      multipleContentTypesMockedContentfulEntriesClientApi(
        testPageContentTypes.map(contentType => ({
          contentType,
          total: 0,
        })),
      ),
    );

    expect(entries2.size).toBe(0);
  });

  describe(pageEntries, () => {
    test('Handle case where there are page entries', async () => {
      const singleTestPageContentType = [
        { contentType: 'page1ContentType', total: 101 },
      ];
      const testPageContentTypes = [
        ...singleTestPageContentType,
        { contentType: 'page2ContentType', total: 1001 },
      ];

      const entries1 = await pageEntries(
        {
          contentfulClientType: 'cda-client',
          options: {
            pageContentTypes: productTypesOptions(
              singleTestPageContentType.map(({ contentType }) => contentType),
            ),
          },
          preview: false,
        },
        multipleContentTypesMockedContentfulEntriesClientApi(
          singleTestPageContentType,
        ),
      );
      const entries1Ids = [...entries1.values()].map(e => e.sys.id);
      const expectedEntries1Ids = singleTestPageContentType.flatMap(
        ({ total, contentType }) =>
          [...Array(total).keys()].map((_, idx) =>
            mockedEntrySysId(contentType, idx),
          ),
      );

      expect(entries1Ids).toEqual(expectedEntries1Ids);

      const entries2 = await pageEntries(
        {
          contentfulClientType: 'cda-client',
          options: {
            pageContentTypes: productTypesOptions(
              testPageContentTypes.map(({ contentType }) => contentType),
            ),
          },
          preview: false,
        },
        multipleContentTypesMockedContentfulEntriesClientApi(
          testPageContentTypes,
        ),
      );

      const entries2Ids = [...entries2.values()].map(e => e.sys.id);
      const expectedEntries2Ids = testPageContentTypes.flatMap(
        ({ total, contentType }) =>
          [...Array(total).keys()].map((_, idx) =>
            mockedEntrySysId(contentType, idx),
          ),
      );

      expect(entries2Ids).toEqual(expectedEntries2Ids);
    });
  });
});
