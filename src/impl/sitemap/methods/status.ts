import { ArboretumClientT } from '../../../arboretum-client';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { localizedSitemapFromCacheOrBuildEff } from '../helpers/build-localized-sitemap';

export const status =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'options' | 'sitemap' | 'lastUpdatedAt' | 'pageHomeTagId' | "regenerationInProgress"
    >,
  ): ArboretumClientT['status'] =>
  () => {
    const pagesCount = [...ctx.data.locales.values()].reduce((acc, locale) => {
      const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);

      if (sitemap._tag === 'Right') {
        return sitemap.right.sitemap.size + acc;
      } else {
        return acc;
      }
    }, 0);

    const localesCount = ctx.data.locales.size;

    return {
      pagesCount,
      localesCount,
      lastUpdatedAt: ctx.lastUpdatedAt,
      contentful: ctx.options,
      regenerationInProgress: ctx.regenerationInProgress
    };
  };
