import {
  ArboretumClientT,
  ArboretumPageNodeT,
} from '../../../arboretum-client';
import { stringSimilarity } from '../../../utils/string-similarity';
import {
  ArboretumClientCtx,
  LocalizedSitemapT,
  PageT,
  RedirectT,
} from '../../arboretum-client.impl';
import { localizedSitemapFromCacheOrBuildEff } from '../helpers/build-localized-sitemap';
import { toArboretumPageWithMissingData } from '../adapters/to-arboretum-page-with-missing-data-adapter';
import { redirectToArboretumPage } from '../adapters/redirect-to-arboretum-page-adapter';

const minPhraseSimilarity = 0.4;
const defaultLimit = 20;

type PageSearchResultT = { phraseSimilarity: number; page: ArboretumPageNodeT };

const pagePhraseSimilarity = (
  page: PageT,
  path: string,
  phrase: string,
): number => {
  const slugSimilarity = stringSimilarity(phrase, page.slug);
  const pathSimilarity = stringSimilarity(phrase, path);
  const idSimilarity = stringSimilarity(phrase, page.sys.id);
  return Math.max(...[slugSimilarity, pathSimilarity, idSimilarity]);
};

const redirectPhraseSimilarity = (
  redirect: RedirectT,
  phrase: string,
): number => {
  const pathSimilarity = stringSimilarity(phrase, redirect.path);
  const idSimilarity = stringSimilarity(phrase, redirect.sys.id);
  return Math.max(...[pathSimilarity, idSimilarity]);
};

const localizedRecursiveSearch = (
  localeCode: string,
  localizedSitemap: LocalizedSitemapT,
  phrase: string,
  parentPath: string,
  currentPage: PageT | RedirectT,
): Array<PageSearchResultT> => {
  const getPath = (page: PageT) =>
    page.sys.id === localizedSitemap.root.sys.id
      ? parentPath
      : parentPath + '/' + page.slug;
  const phraseSimilarity =
    currentPage.type === 'page'
      ? pagePhraseSimilarity(currentPage, getPath(currentPage), phrase)
      : redirectPhraseSimilarity(currentPage, phrase);

  const childrenResults =
    currentPage.type === 'page'
      ? currentPage.childPages.flatMap(({ sys: { id } }) => {
          const childPage = localizedSitemap.sitemap.get(id);
          const path = getPath(currentPage);
          return childPage
            ? localizedRecursiveSearch(
                localeCode,
                localizedSitemap,
                phrase,
                path,
                childPage,
              )
            : [];
        })
      : [];
  const res: Array<PageSearchResultT> = [];
  if (phraseSimilarity >= minPhraseSimilarity) {
    res.push({
      phraseSimilarity,
      page:
        currentPage.type === 'page'
          ? toArboretumPageWithMissingData(localeCode)(
              currentPage,
              undefined,
              undefined,
            )
          : redirectToArboretumPage(localeCode)(currentPage),
    });
  }
  res.push(...childrenResults);
  return res;
};

// Primitive implementation that can be inefficient for large sitemaps
export const search =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'sitemap' | 'options' | 'pageHomeTagId'
    >,
  ): ArboretumClientT['search'] =>
  (phrase, localeCode, limit) => {
    return [...ctx.data.locales.values()]
      .filter(locale => (localeCode ? locale.code === localeCode : true))
      .flatMap(locale => {
        const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);

        const homePage =
          sitemap._tag === 'Right'
            ? sitemap.right.sitemap.get(sitemap.right.root.sys.id)
            : undefined;

        if (sitemap._tag === 'Right' && homePage) {
          return localizedRecursiveSearch(
            locale.code,
            sitemap.right,
            phrase,
            `/${locale.code}`,
            homePage,
          );
        } else {
          return [];
        }
      })
      .sort((a, b) => b.phraseSimilarity - a.phraseSimilarity)
      .slice(0, limit || defaultLimit)
      .map(({ page }) => page);
  };
