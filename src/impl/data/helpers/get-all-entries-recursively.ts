import { EntryT } from '../../../clients/contentful-client/contentful-client';
import { ArboretumClientCtx, SysIdT } from '../../arboretum-client.impl';

export type PagesT = { [sys: SysIdT]: EntryT };

export const getAllEntriesRecursively = async (
  { getEntries }: Pick<ArboretumClientCtx['clientApi'], 'getEntries'>,
  contentType: string,
  skip: number,
  acc: Array<EntryT>,
  select?: string,
  limit: number = 1000,
): Promise<Array<EntryT>> => {
  const { items } = await getEntries({
    limit,
    skip,
    content_type: contentType,
    include: 0,
    select,
    locale: '*',
  });

  acc.push(...items);
  return items.length >= limit
    ? getAllEntriesRecursively(
        { getEntries },
        contentType,
        skip + limit,
        acc,
        select,
      )
    : acc;
};
