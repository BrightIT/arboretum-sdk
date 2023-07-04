import { ArboretumPageT } from '../../../arboretum-client';
import { LocalizedSitemapT, PageT } from '../../arboretum-client.impl';
import { redirectToArboretumPage } from '../adapters/redirect-to-arboretum-page-adapter';
import { toArboretumPageWithMissingData } from '../adapters/to-arboretum-page-with-missing-data-adapter';
import { findChildren } from './find-children';

export const pageChildren = (
  localeCode: string,
  sitemap: LocalizedSitemapT['sitemap'],
  page: PageT & { path: string },
): NonNullable<ArboretumPageT['children']> =>
  findChildren(sitemap)(page).map(childPage =>
    childPage.type === 'page'
      ? toArboretumPageWithMissingData(localeCode)(
          childPage,
          undefined,
          undefined,
        )
      : redirectToArboretumPage(localeCode)(childPage),
  );
