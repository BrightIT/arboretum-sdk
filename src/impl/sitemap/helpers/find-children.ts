import {
  LocalizedSitemapT,
  PageT,
  RedirectT,
} from '../../arboretum-client.impl';

export const findChildren =
  (sitemap: LocalizedSitemapT['sitemap']) =>
  (page: PageT): Array<PageT | RedirectT> => {
    return page.childPages.flatMap(({ sys: { id } }) => {
      const childPage = sitemap.get(id);
      return childPage ? [childPage] : [];
    });
  };
