import {
  ArboretumClientCtx,
  LocalizedSitemapT,
  SitemapT,
} from '../../arboretum-client.impl';
import { buildLocalizedSitemap } from './build-localized-sitemap';
import { SitemapDataT } from '../../data/sitemap-data';
import { LocaleT } from '../../../clients/contentful-client/contentful-client';
import { Either } from '../../../utils/fp-utils';
import { arrayToMap } from '../../../utils/array-to-map';

export const buildSitemapEagerly = (
  ctx: Pick<ArboretumClientCtx, 'options' | 'data' | 'pageHomeTagId'>,
  locales: SitemapDataT['locales'],
): SitemapT =>
  arrayToMap<LocaleT, Either<string, LocalizedSitemapT>>(locale => locale.code)(
    locale =>
      buildLocalizedSitemap(ctx.data, ctx.options, ctx.pageHomeTagId, locale),
  )([...locales.values()]);
