import { pageEntries } from "./page-entries";
import { Either, left, right } from "../../utils/fp-utils";
import { ArboretumClientCtx } from "../arboretum-client.impl";
import { contentTypes, ContentTypesT } from "./content-types";
import { locales, LocalesT } from "./locales";
import { redirectEntries } from "./redirect-entries";
import {
  EntryIdT,
  EntryT,
} from "../../clients/contentful-client/contentful-client";
import {
  homePagesByTagId,
  HomePagesByTagIdT,
} from "./helpers/home-pages-by-tag-id";

export type EntriesT = Map<EntryIdT, EntryT>;

export type SitemapDataT = LocalesT & {
  contentTypes: ContentTypesT;
  pages: EntriesT;
  redirects: Array<EntryT>;
  homePagesByTagId: HomePagesByTagIdT["homePagesByTagId"];
};
export const sitemapData = async (
  ctx: Pick<
    ArboretumClientCtx,
    | "clientApi"
    | "options"
    | "pageHomeTagId"
    | "localeTagIdPrefix"
    | "contentfulClientType"
    | "cmaPreviewClientApi"
    | "preview"
    | "pageTagIdPrefix"
  >
): Promise<
  Either<Array<string>, { data: SitemapDataT; warnings?: Array<string> }>
> => {
  const [pages, redirects, ct, l] = await Promise.all([
    pageEntries(ctx, ctx.clientApi, ctx.cmaPreviewClientApi),
    redirectEntries(ctx),
    contentTypes(ctx),
    locales(ctx),
  ]);

  let warnings: Array<string> = [];

  ct.warnings && warnings.push(...ct.warnings);

  if (l._tag === "Left") {
    return left([l.left]);
  } else {
    const pagesByTagId = homePagesByTagId(ctx, l.right, pages.homePages);
    pagesByTagId.warnings && warnings.push(...pagesByTagId.warnings);
    return right({
      data: {
        ...l.right,
        homePagesByTagId: pagesByTagId.homePagesByTagId,
        contentTypes: ct.contentTypes,
        pages: pages.allPages,
        redirects,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  }
};
