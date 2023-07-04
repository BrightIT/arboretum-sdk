import { LocaleT } from '../../../clients/contentful-client/contentful-client';
import { arrayToMap } from '../../../utils/array-to-map';
import {
  ArboretumClientCtx,
  PagesByTagIdT,
  PagesByTagIdV,
} from '../../arboretum-client.impl';
import { SitemapDataT } from '../../data/sitemap-data';
import { buildLocalizedPagesByTagId } from './localized-pages-by-tag-id';

export const buildPagesByTagEagerly = (
  ctx: Pick<
    ArboretumClientCtx,
    'options' | 'data' | 'pageHomeTagId' | 'sitemap' | 'localeTagIdPrefix'
  >,
  locales: SitemapDataT['locales'],
): PagesByTagIdT =>
  arrayToMap<LocaleT, PagesByTagIdV>(locale => locale.code)(locale =>
    buildLocalizedPagesByTagId(ctx, locale),
  )(Object.values(locales));
