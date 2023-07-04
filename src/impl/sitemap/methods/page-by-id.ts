import { ArboretumClientT } from '../../../arboretum-client';
import { left, right } from '../../../utils/fp-utils';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { localizedSitemapFromCacheOrBuildEff } from '../helpers/build-localized-sitemap';
import { toArboretumPage } from '../adapters/to-arboretum-page-adapter';
import { redirectToArboretumPage } from '../adapters/redirect-to-arboretum-page-adapter';

export const pageById =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'sitemap' | 'options' | 'pageHomeTagId'
    >,
  ): ArboretumClientT['pageById'] =>
  (localeCode, id, options) => {
    const locale = ctx.data.locales.get(localeCode);

    if (locale) {
      const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);
      if (sitemap._tag === 'Right') {
        const page = sitemap.right.sitemap.get(id);
        if (page) {
          return right(
            page.type === 'page'
              ? toArboretumPage(sitemap.right, localeCode, options)(page)
              : redirectToArboretumPage(locale.code)(page),
          );
        } else {
          return left(
            `Failed to find page by id: ${id} and locale: ${locale.code}`,
          );
        }
      } else {
        return left(sitemap.left);
      }
    } else {
      return left(`Failed to find locale by code: ${localeCode}`);
    }
  };
