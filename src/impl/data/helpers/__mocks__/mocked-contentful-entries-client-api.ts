import { ArboretumClientCtx } from '../../../arboretum-client.impl';

const defaultLimit = 100;
const defaultSkip = 0;

export const mockedEntrySysId = (contentType: string, idx: number) =>
  `${contentType}${idx}`;

export const mockedContentfulEntriesClientApi: (
  contentType: string,
  total: number,
) => Pick<ArboretumClientCtx['clientApi'], 'getEntries'> = (
  contentType,
  total,
) => ({
  getEntries: query => {
    const limit =
      typeof query?.limit !== 'undefined' ? query.limit : defaultLimit;
    const skip = typeof query?.skip !== 'undefined' ? query.skip : defaultSkip;
    const remaining = total - skip;
    const contentTypeId = query?.content_type || contentType;

    const items = [...Array(remaining >= limit ? limit : remaining).keys()].map(
      (_, idx) => ({
        sys: {
          id: mockedEntrySysId(contentTypeId, skip + idx),
          contentType: {
            sys: { id: contentTypeId },
          },
        },
        fields: [],
      }),
    );

    return Promise.resolve({
      items,
      limit,
      skip,
      total,
    });
  },
});

export const multipleContentTypesMockedContentfulEntriesClientApi: (
  contentTypes: Array<{
    contentType: string;
    total: number;
  }>,
) => Pick<ArboretumClientCtx['clientApi'], 'getEntries'> = contentTypes => ({
  getEntries: query => {
    const contentType = contentTypes.find(
      ct => ct.contentType === query?.content_type,
    );
    return contentType
      ? mockedContentfulEntriesClientApi(
          contentType.contentType,
          contentType.total,
        ).getEntries(query)
      : Promise.resolve({
          items: [],
          limit: query?.limit || defaultLimit,
          skip: query?.skip || defaultSkip,
          total: 0,
        });
  },
});
