import { ArboretumClientContentfulConfigOptionsT } from '../../arboretum-client';
import { ArboretumClientCtx } from '../arboretum-client.impl';
import {
  EntryIdT,
  EntryT,
  StatusT,
} from '../../clients/contentful-client/contentful-client';
import { entryStatus } from './helpers/entry-status';
import { getAllEntriesRecursively } from './helpers/get-all-entries-recursively';
import { EntriesT } from './sitemap-data';
import { arrayToMap } from '../../utils/array-to-map';

const getAllPageEntriesRecursively = async (
  { getEntries }: Pick<ArboretumClientCtx['clientApi'], 'getEntries'>,
  contentfulClientType: ArboretumClientCtx['contentfulClientType'],
  pageContentTypeOpt: ArboretumClientContentfulConfigOptionsT['pageContentTypes'][string] & {
    id: string;
  },
  skip: number,
  acc: Array<EntryT>,
  select?: string,
): Promise<Array<EntryT>> => {
  const fieldsSelect = [
    pageContentTypeOpt.slugFieldId,
    pageContentTypeOpt.childPagesFieldId,
    pageContentTypeOpt.titleFieldId,
  ].flatMap(id => (id ? [`fields.${id}`] : []));

  return getAllEntriesRecursively(
    { getEntries },
    pageContentTypeOpt.id,
    skip,
    acc,
    /* For some reason select param causes errors in CMA. I'm getting the following response: 
  {
    "status": 400,
    "statusText": "Bad Request",
    "message": "The query you sent was invalid. Probably a filter or ordering specification is not applicable to the type of a field.",
    "details": {
      "errors": [
        {
          "name": "select",
          "details": "Select is only applicable when querying a collection of entities."
        }
      ]
    },
    "request": {
      "url": "/spaces/8h4rcnu50txt/environments/dacjan-test/public/entries",
      "method": "get",
      ...
    },
}*/
    select || contentfulClientType === 'cma-client'
      ? undefined
      : ['sys', 'metadata', ...fieldsSelect].join(','),
  );
};

const cmaOnlyEntriesStatusMap = async (
  { getEntries }: Pick<ArboretumClientCtx['clientApi'], 'getEntries'>,
  contentfulClientType: ArboretumClientCtx['contentfulClientType'],
  options: ArboretumClientCtx['options'],
): Promise<Map<EntryIdT, StatusT | undefined>> => {
  const pageContentTypes = Object.entries(options.pageContentTypes);
  const pageEntries = await Promise.all(
    pageContentTypes.map(([id, fieldIds]) =>
      getAllPageEntriesRecursively(
        { getEntries },
        contentfulClientType,
        { id, ...fieldIds },
        0,
        [],
        'sys',
      ),
    ),
  );

  return arrayToMap<EntryT, StatusT | undefined>(e => e.sys.id)(entry =>
    entryStatus(entry.sys),
  )(pageEntries.flat());
};

export const pageEntries = async (
  ctx: Pick<ArboretumClientCtx, 'options' | 'contentfulClientType' | 'preview'>,
  apiClient: Pick<ArboretumClientCtx['clientApi'], 'getEntries'>,
  cmaPreviewClientApi?: Pick<
    NonNullable<ArboretumClientCtx['cmaPreviewClientApi']>,
    'getEntries'
  >,
): Promise<EntriesT> => {
  const { options } = ctx;
  const pageContentTypes = Object.entries(options.pageContentTypes);

  const pageEntriesPromise = Promise.all(
    pageContentTypes.map(([id, fieldIds]) =>
      getAllPageEntriesRecursively(
        apiClient,
        ctx.contentfulClientType,
        { id, ...fieldIds },
        0,
        [],
      ),
    ),
  );
  /*
    This is woraround. Published entries from CMA (the same with CDA and CPA)
    don't have enough data to properly compute entry status
  */
  const statusRecordPromise =
    ctx.options.includeEntryStatus &&
    ctx.contentfulClientType === 'cma-client' &&
    !ctx.preview &&
    cmaPreviewClientApi
      ? cmaOnlyEntriesStatusMap(
          cmaPreviewClientApi,
          ctx.contentfulClientType,
          ctx.options,
        )
      : Promise.resolve(new Map<EntryIdT, StatusT | undefined>());

  const [pageEntries, cmaOnlyStatusRecord] = await Promise.all([
    pageEntriesPromise,
    statusRecordPromise,
  ]);

  return arrayToMap<EntryT, EntryT>(e => e.sys.id)(entry => {
    const cmaOnlyStatus =
      ctx.contentfulClientType === 'cma-client'
        ? entryStatus(entry.sys) || cmaOnlyStatusRecord.get(entry.sys.id)
        : undefined;
    if (cmaOnlyStatus) {
      entry.sys = { ...entry.sys, cmaOnlyStatus };
    }
    return entry;
  })(pageEntries.flat());
};
