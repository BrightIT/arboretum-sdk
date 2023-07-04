import {
  ArboretumClientT,
  ArboretumPageNodeT,
} from '../../../arboretum-client';
import { left, right } from '../../../utils/fp-utils';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { localizedSitemapFromCacheOrBuildEff } from '../helpers/build-localized-sitemap';
import { toArboretumPage } from '../adapters/to-arboretum-page-adapter';
import { redirectToArboretumPage } from '../adapters/redirect-to-arboretum-page-adapter';
import { localizedPagesByTagIdFromCacheOrBuildEff } from '../helpers/localized-pages-by-tag-id';

export const pagesByTagId =
  (
    ctx: Pick<
      ArboretumClientCtx,
      | 'data'
      | 'sitemap'
      | 'options'
      | 'pageHomeTagId'
      | 'localeTagIdPrefix'
      | 'pagesByTagId'
    >,
  ): ArboretumClientT['pagesByTagId'] =>
  (localeCode, tagId, options) => {
    const locale = ctx.data.locales.get(localeCode);
    if (locale) {
      const pagesByTagId = localizedPagesByTagIdFromCacheOrBuildEff(
        ctx,
        locale,
      );
      const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);
      if (pagesByTagId._tag === 'Left') {
        return pagesByTagId;
      } else if (sitemap._tag === 'Left') {
        return sitemap;
      } else {
        const pages =
          pagesByTagId.right.get(tagId)?.flatMap(({ sys }) => {
            const page = sitemap.right.sitemap.get(sys.id);
            const arboretumPage: ArboretumPageNodeT | undefined =
              page?.type === 'page'
                ? toArboretumPage(sitemap.right, locale.code, options)(page)
                : page
                ? redirectToArboretumPage(locale.code)(page)
                : undefined;
            return arboretumPage ? [arboretumPage] : [];
          }) || [];
        return right(pages);
      }
    } else {
      return left(`Failed to find locale by code: ${localeCode}`);
    }
  };
