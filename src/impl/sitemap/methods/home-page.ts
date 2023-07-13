import { ArboretumClientT } from "../../../arboretum-client";
import { left, right } from "../../../utils/fp-utils";
import { ArboretumClientCtx } from "../../arboretum-client.impl";
import { localizedSitemapFromCacheOrBuildEff } from "../helpers/build-localized-sitemap";
import { toArboretumPage } from "../adapters/to-arboretum-page-adapter";

export const homePage =
  (
    ctx: Pick<
      ArboretumClientCtx,
      "data" | "sitemap" | "options" | "pageHomeTagId"
    >
  ): ArboretumClientT["homePage"] =>
  (localeCode, options) => {
    const locale = ctx.data.locales.get(localeCode);

    if (locale) {
      const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);
      if (sitemap._tag === "Right") {
        const id = sitemap.right.root.sys.id;
        const page = sitemap.right.sitemap.get(id);
        if (page && page.type === "page") {
          return right(
            toArboretumPage(sitemap.right, localeCode, options)(page)
          );
        } else {
          return left(
            `Failed to find home page by id: ${id} and locale: ${locale.code}`
          );
        }
      } else {
        return left(sitemap.left);
      }
    } else {
      return left(`Failed to find locale by code: ${localeCode}`);
    }
  };
