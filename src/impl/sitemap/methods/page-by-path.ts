import { ArboretumClientT } from '../../../arboretum-client';
import { left, right } from '../../../utils/fp-utils';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { localizedSitemapFromCacheOrBuildEff } from '../helpers/build-localized-sitemap';
import { toArboretumPage } from '../adapters/to-arboretum-page-adapter';
import { redirectToArboretumPage } from '../adapters/redirect-to-arboretum-page-adapter';

export const pageByPath =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'sitemap' | 'options' | 'pageHomeTagId'
    >,
  ): ArboretumClientT['pageByPath'] =>
  (path, options) => {
    if (path.length) {
      const [localeCode] = path.split('/').filter(slug => !!slug);
      const locale = ctx.data.locales.get(localeCode);
      if (locale) {
        const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);
        if (sitemap._tag === 'Right') {
          const pageId = sitemap.right.pageIdByPath.get(path.startsWith("/")? path: "/" + path);
          const page = pageId ? sitemap.right.sitemap.get(pageId) : undefined;

          if (page) {
            return right(
              page.type === 'page'
                ? toArboretumPage(sitemap.right, localeCode, options)(page)
                : redirectToArboretumPage(locale.code)(page),
            );
          } else {
            return left(`Failed to find page by path: ${path}`);
          }
        } else {
          return left(sitemap.left);
        }
      } else {
        return left(`Failed to find locale by code: ${localeCode}`);
      }
    } else {
      return left(`Path can't be empty`);
    }
  };
