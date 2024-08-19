import { Either, left, right } from "../../../utils/fp-utils";
import {
  ArboretumClientCtx,
  LocalizedSitemapT,
  PageIdT,
  PageT,
  RedirectT,
} from "../../arboretum-client.impl";
import {
  EntryT,
  LocaleT,
} from "../../../clients/contentful-client/contentful-client";
import { pageEntryAdapter } from "../adapters/page-entry-adapter";
import { redirectEntryAdapter } from "../adapters/redirect-entry-adapter";
import { SitemapDataT } from "../../data/sitemap-data";
import { isRoot } from "./is-root";
import { localizeField } from "./localize-contentful-field";

const getAllRedirects = (
  data: Pick<
    SitemapDataT,
    "locales" | "defaultLocaleCode" | "redirects" | "contentTypes"
  >,
  options: NonNullable<ArboretumClientCtx["options"]["redirectContentType"]>,
  locale: LocaleT,
  parent: Pick<PageT, "sys" | "path">
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

  return data.redirects.flatMap((redirectEntry) => {
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
            redirectEntry
          )
        : undefined;
    return redirect ? [redirect] : [];
  });
};

const findPageFieldF =
  (
    data: Pick<ArboretumClientCtx["data"], "contentTypes">,
    options: Pick<ArboretumClientCtx["options"], "pageContentTypes">,
    pageContentTypeId: string
  ) =>
  (fieldId: string) => {
    const { contentTypes } = data;

    const pageContentType = contentTypes.get(pageContentTypeId);
    const pageContentTypeConfig = options.pageContentTypes[pageContentTypeId];
    return pageContentType && pageContentTypeConfig
      ? pageContentType.fields.get(fieldId)
      : undefined;
  };

const getChildrenRefsByParentId = (
  data: Pick<
    ArboretumClientCtx["data"],
    "pages" | "contentTypes" | "defaultLocaleCode" | "locales"
  >,
  locale: LocaleT,
  options: ArboretumClientCtx["options"]
): Map<string, Array<{ sys: { id: string } }>> => {
  const { pages } = data;

  const acc = new Map<string, Array<{ sys: { id: string } }>>();
  pages.forEach((page) => {
    const pageContentTypeConfig =
      options.pageContentTypes[page.sys.contentType.sys.id];
    const findPageField = findPageFieldF(
      data,
      options,
      page.sys.contentType.sys.id
    );

    const parentPageField = pageContentTypeConfig.parentPageFieldId
      ? findPageField(pageContentTypeConfig.parentPageFieldId)
      : undefined;

    const fieldValue = localizeField(data, locale);

    const parentPage = parentPageField
      ? fieldValue<{ sys?: { id?: string } }>(
          parentPageField.localized,
          page.fields[parentPageField.id]
        )
      : undefined;

    const parentPageId = parentPage?.sys?.id;
    if (parentPageId) {
      const pageRef = { sys: { id: page.sys.id } };
      const maybePages = acc.get(parentPageId);
      if (maybePages) {
        maybePages.push(pageRef);
      } else {
        acc.set(parentPageId, [pageRef]);
      }
    }
  });
  return acc;
};

const buildLocalizedSitemapArrRecursively = (
  data: Pick<
    ArboretumClientCtx["data"],
    | "homePagesByTagId"
    | "pages"
    | "contentTypes"
    | "defaultLocaleCode"
    | "locales"
    | "redirects"
  >,
  options: ArboretumClientCtx["options"],
  locale: LocaleT,
  parent: (NonNullable<PageT["parent"]> & { path: string }) | undefined,
  childrenRefsByPageId: Map<string, Array<{ sys: { id: string } }>> | undefined,
  pageEntry: EntryT,
  acc: Map<PageIdT, PageT | RedirectT>
): Map<PageIdT, PageT | RedirectT> => {
  const { pages } = data;
  const pageContentTypeConfig =
    options.pageContentTypes[pageEntry.sys.contentType.sys.id];

  const findPageField = findPageFieldF(
    data,
    options,
    pageEntry.sys.contentType.sys.id
  );

  const slugField = findPageField(pageContentTypeConfig.slugFieldId);

  const titleField = pageContentTypeConfig.titleFieldId
    ? findPageField(pageContentTypeConfig.titleFieldId)
    : undefined;

  const childPagesField = pageContentTypeConfig.childPagesFieldId
    ? findPageField(pageContentTypeConfig.childPagesFieldId)
    : undefined;

  const fieldValue = localizeField(data, locale);

  const childrenRefs = childrenRefsByPageId
    ? childrenRefsByPageId.get(pageEntry.sys.id) || []
    : childPagesField
    ? fieldValue<Array<{ sys?: { id?: string } }>>(
        childPagesField.localized,
        pageEntry.fields[childPagesField.id]
      )?.flatMap((childPage) =>
        childPage?.sys?.id ? [{ sys: { id: childPage?.sys.id } }] : []
      ) || []
    : [];

  const page = slugField
    ? pageEntryAdapter(
        data,
        slugField,
        titleField,
        childrenRefs,
        locale,
        parent,
        pageEntry
      )
    : undefined;

  if (page) {
    let validChildPages = page.childPages.filter(
      (c) => pages.get(c.sys.id) && !acc.get(c.sys.id)
    );

    const redirectChildPages =
      isRoot(page) && options.redirectContentType
        ? getAllRedirects(data, options.redirectContentType, locale, page)
        : [];

    redirectChildPages.forEach((r) => {
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
          childrenRefsByPageId,
          childPageEntry,
          acc
        );
    });

    return acc;
  } else {
    return acc;
  }
};

export const buildLocalizedSitemap = (
  data: Pick<
    ArboretumClientCtx["data"],
    | "homePagesByTagId"
    | "pages"
    | "contentTypes"
    | "defaultLocaleCode"
    | "locales"
    | "redirects"
  >,
  options: ArboretumClientCtx["options"],
  pageHomeTagId: ArboretumClientCtx["pageHomeTagId"],
  locale: LocaleT
): Either<string, LocalizedSitemapT> => {
  const { homePagesByTagId, pages } = data;
  const homePageRef = homePagesByTagId
    ?.get(locale.code)
    ?.get(pageHomeTagId)?.[0]?.sys?.id;
  const homePageEntry = homePageRef ? pages.get(homePageRef) : undefined;

  if (homePageEntry) {
    const childrenRefsByPageId =
      options.sitemapRepresentation === "child-to-parent"
        ? getChildrenRefsByParentId(data, locale, options)
        : undefined;

    const sitemap = buildLocalizedSitemapArrRecursively(
      data,
      options,
      locale,
      undefined,
      childrenRefsByPageId,
      homePageEntry,
      new Map()
    );

    return right({
      root: { sys: homePageEntry.sys },
      sitemap,
      pageIdByPath: new Map(
        [...sitemap.values()].map((page) => [page.path, page.sys.id])
      ),
    });
  } else {
    return left(`Homepage required but not defined (locale: ${locale.code})`);
  }
};

export const localizedSitemapFromCacheOrBuildEff = (
  ctx: Pick<
    ArboretumClientCtx,
    "options" | "data" | "pageHomeTagId" | "sitemap"
  >,
  locale: LocaleT
): Either<string, LocalizedSitemapT> => {
  const cachedLocalizedSitemap = ctx.sitemap.get(locale.code);
  const sitemapE = cachedLocalizedSitemap
    ? cachedLocalizedSitemap
    : buildLocalizedSitemap(ctx.data, ctx.options, ctx.pageHomeTagId, locale);
  ctx.sitemap.set(locale.code, sitemapE);
  return sitemapE;
};
