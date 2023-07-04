import { Either, left, right } from '../../../utils/fp-utils';
import {
  ArboretumClientCtx,
  LocalizedSitemapT,
  PageIdT,
  PageT,
  RedirectT,
} from '../../arboretum-client.impl';
import {
  EntryT,
  LocaleT,
} from '../../../clients/contentful-client/contentful-client';
import { pageEntryAdapter } from '../adapters/page-entry-adapter';
import { redirectEntryAdapter } from '../adapters/redirect-entry-adapter';
import { SitemapDataT } from '../../data/sitemap-data';
import { isRoot } from './is-root';

const getAllRedirects = (
  data: Pick<
    SitemapDataT,
    'locales' | 'defaultLocaleCode' | 'redirects' | 'contentTypes'
  >,
  options: NonNullable<ArboretumClientCtx['options']['redirectContentType']>,
  locale: LocaleT,
  parent: RedirectT['parent'],
): Array<RedirectT> => {
  const redirectContentType = options.id
    ? data.contentTypes.get(options.id)
    : undefined;
  const findField = (fieldId: string) =>
    redirectContentType?.fields.get(fieldId);

  const pageField = findField(options.pageFieldId);

  const pathField = findField(options.pathFieldId);

  const typeField = findField(options.typeFieldId);

  const titleField = options.titleFieldId
    ? findField(options.titleFieldId)
    : undefined;

  return data.redirects.flatMap(redirectEntry => {
    const redirect =
      pageField && pathField && typeField
        ? redirectEntryAdapter(
            data,
            pageField,
            pathField,
            typeField,
            titleField,
            parent,
            locale,
            redirectEntry,
          )
        : undefined;
    return redirect ? [redirect] : [];
  });
};

const buildLocalizedSitemapArrRecursively = (
  data: Pick<
    ArboretumClientCtx['data'],
    | 'homePagesByTagId'
    | 'pages'
    | 'contentTypes'
    | 'defaultLocaleCode'
    | 'locales'
    | 'redirects'
  >,
  options: ArboretumClientCtx['options'],
  locale: LocaleT,
  parent: (NonNullable<PageT['parent']> & { path: string }) | undefined,
  pageEntry: EntryT,
  acc: Map<PageIdT, PageT | RedirectT>,
): Map<PageIdT, PageT | RedirectT> => {
  const { pages, contentTypes } = data;
  const pageContentType = contentTypes.get(pageEntry.sys.contentType.sys.id);
  const pageContentTypeConfig =
    options.pageContentTypes[pageEntry.sys.contentType.sys.id];

  const findPageField = (fieldId: string) =>
    pageContentType && pageContentTypeConfig
      ? pageContentType.fields.get(fieldId)
      : undefined;

  const slugField = findPageField(pageContentTypeConfig.slugFieldId);

  const titleField = pageContentTypeConfig.titleFieldId
    ? findPageField(pageContentTypeConfig.titleFieldId)
    : undefined;

  const childPagesField = pageContentTypeConfig.childPagesFieldId
    ? findPageField(pageContentTypeConfig.childPagesFieldId)
    : undefined;

  const page = slugField
    ? pageEntryAdapter(
        data,
        slugField,
        titleField,
        childPagesField,
        locale,
        parent,
        pageEntry,
      )
    : undefined;

  if (page) {
    let validChildPages = page.childPages.filter(
      c => pages.get(c.sys.id) && !acc.get(c.sys.id),
    );

    const redirectChildPages =
      isRoot(page) && options.redirectContentType
        ? getAllRedirects(data, options.redirectContentType, locale, {
            sys: { id: page.sys.id },
          })
        : [];

    redirectChildPages.forEach(r => {
      const id = r.sys.id;
      acc.set(id, r);
      validChildPages.push({ sys: { id } });
    });

    const pageWithValidChildPages = {
      ...page,
      childPages: validChildPages,
    };
    acc.set(page.sys.id, pageWithValidChildPages);

    validChildPages.forEach(({ sys: { id } }) => {
      const childPageEntry = pages.get(id);
      childPageEntry &&
        buildLocalizedSitemapArrRecursively(
          data,
          options,
          locale,
          { sys: pageEntry.sys, path: page.path },
          childPageEntry,
          acc,
        );
    });

    return acc;
  } else {
    return acc;
  }
};

export const buildLocalizedSitemap = (
  data: Pick<
    ArboretumClientCtx['data'],
    | 'homePagesByTagId'
    | 'pages'
    | 'contentTypes'
    | 'defaultLocaleCode'
    | 'locales'
    | 'redirects'
  >,
  options: ArboretumClientCtx['options'],
  pageHomeTagId: ArboretumClientCtx['pageHomeTagId'],
  locale: LocaleT,
): Either<string, LocalizedSitemapT> => {
  const { homePagesByTagId, pages } = data;
  const homePageRef = homePagesByTagId
    ?.get(locale.code)
    ?.get(pageHomeTagId)?.[0]?.sys?.id;
  const homePageEntry = homePageRef ? pages.get(homePageRef) : undefined;

  if (homePageEntry) {
    const sitemap = buildLocalizedSitemapArrRecursively(
      data,
      options,
      locale,
      undefined,
      homePageEntry,
      new Map(),
    );

    return right({
      root: { sys: homePageEntry.sys },
      sitemap,
      pageIdByPath: new Map(
        [...sitemap.values()].map(page => [page.path, page.sys.id]),
      ),
    });
  } else {
    return left(`Homepage required but not defined (locale: ${locale.code})`);
  }
};

export const localizedSitemapFromCacheOrBuildEff = (
  ctx: Pick<
    ArboretumClientCtx,
    'options' | 'data' | 'pageHomeTagId' | 'sitemap'
  >,
  locale: LocaleT,
): Either<string, LocalizedSitemapT> => {
  const cachedLocalizedSitemap = ctx.sitemap.get(locale.code);
  const sitemapE = cachedLocalizedSitemap
    ? cachedLocalizedSitemap
    : buildLocalizedSitemap(ctx.data, ctx.options, ctx.pageHomeTagId, locale);
  ctx.sitemap.set(locale.code, sitemapE);
  return sitemapE;
};
