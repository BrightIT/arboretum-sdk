import { ArboretumPageT, OptionsT } from '../../../arboretum-client';
import { LocalizedSitemapT, PageT } from '../../arboretum-client.impl';
import { pageAncestors } from '../helpers/page-ancestors';
import { pageChildren } from '../helpers/page-children';
import { toArboretumPageWithMissingData } from './to-arboretum-page-with-missing-data-adapter';

export const toArboretumPage =
  (sitemap: LocalizedSitemapT, localeCode: string, options?: OptionsT) =>
  (page: PageT): ArboretumPageT => {
    const ancestors = options?.withAncestors
      ? pageAncestors(localeCode, sitemap, page)
      : undefined;
    const children = options?.withChildren
      ? pageChildren(localeCode, sitemap.sitemap, page)
      : undefined;

    return toArboretumPageWithMissingData(localeCode)(
      page,
      ancestors,
      children,
    );
  };
