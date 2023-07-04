import { ArboretumPageT } from '../../../arboretum-client';
import { LocalizedSitemapT, PageT } from '../../arboretum-client.impl';
import { toArboretumPageWithMissingData } from '../adapters/to-arboretum-page-with-missing-data-adapter';
import { findAncestors } from './find-ancestors';

export const pageAncestors = (
  localeCode: string,
  sitemap: LocalizedSitemapT,
  page: PageT,
): ArboretumPageT['ancestors'] => {
  const ancestors = findAncestors(sitemap, page);

  return ancestors?.map(ancestor =>
    toArboretumPageWithMissingData(localeCode)(ancestor, undefined, undefined),
  );
};
