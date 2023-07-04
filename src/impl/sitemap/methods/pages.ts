import { ArboretumClientT } from '../../../arboretum-client';
import { LocaleT } from '../../../clients/contentful-client/contentful-client';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { Either, left, right } from '../../../utils/fp-utils';
import { SitemapDataT } from '../../data/sitemap-data';
import { localizedSitemapFromCacheOrBuildEff } from '../helpers/build-localized-sitemap';
import { toArboretumPage } from '../adapters/to-arboretum-page-adapter';
import { redirectToArboretumPage } from '../adapters/redirect-to-arboretum-page-adapter';

const singleOrAllLocalesE =
  (locales: SitemapDataT['locales']) =>
  (localeCode?: string): Either<string, Array<LocaleT>> => {
    if (localeCode) {
      const locale = locales.get(localeCode);
      return locale
        ? right([locale])
        : left(`Failed to find locale by code: ${localeCode}`);
    } else {
      return right([...locales.values()]);
    }
  };

export const pages =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'sitemap' | 'options' | 'pageHomeTagId'
    >,
  ): ArboretumClientT['pages'] =>
  options => {
    const localeCode = options?.localeCode;
    const localesE = singleOrAllLocalesE(ctx.data.locales)(localeCode);
    const skip = typeof options?.skip !== 'undefined' ? options.skip : 0;

    if (localesE._tag === 'Right') {
      const pages = localesE.right
        .flatMap(locale => {
          const localizedSitemapE = localizedSitemapFromCacheOrBuildEff(
            ctx,
            locale,
          );

          const pages =
            localizedSitemapE._tag === 'Right'
              ? [...localizedSitemapE.right.sitemap.values()].map(p =>
                  p.type === 'page'
                    ? toArboretumPage(
                        localizedSitemapE.right,
                        locale.code,
                        options,
                      )(p)
                    : redirectToArboretumPage(locale.code)(p),
                )
              : [];
          return pages;
        })
        .sort((p1, p2) => {
          if (p1.id < p2.id) return -1;
          if (p1.id > p2.id) return 1;
          return 0;
        })
        .slice(skip, options?.limit);

      return right(pages);
    } else {
      return localesE;
    }
  };
