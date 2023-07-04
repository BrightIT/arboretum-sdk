import {
  ArboretumClientCtx,
  MetadataT,
  PagesByTagIdV,
} from '../../arboretum-client.impl';
import { LocaleT } from '../../../clients/contentful-client/contentful-client';
import { localizedSitemapFromCacheOrBuildEff } from './build-localized-sitemap';
import { right } from '../../../utils/fp-utils';
import { parseLocaleTag } from '../../data/helpers/parse-locale-tag';
import { groupBy } from '../../../utils/group-by';

const tagFilterPredicate =
  (
    localeTagIdPrefix: ArboretumClientCtx['localeTagIdPrefix'],
    localeCode: string,
    metadata: MetadataT,
  ) =>
  (tagId: string) => {
    const maybeLocaleCodes = metadata.tags.flatMap(({ sys }) => {
      const locale = parseLocaleTag(localeTagIdPrefix)(sys.id);
      return locale ? [locale.localeCode] : [];
    });

    const localesCondition =
      maybeLocaleCodes && maybeLocaleCodes.length > 0
        ? !!maybeLocaleCodes.find(code => localeCode === code)
        : true;

    const tagCondition = !!metadata.tags.find(({ sys }) => sys.id === tagId);

    return localesCondition && tagCondition;
  };

export const buildLocalizedPagesByTagId = (
  ctx: Pick<
    ArboretumClientCtx,
    'options' | 'data' | 'pageHomeTagId' | 'sitemap' | 'localeTagIdPrefix'
  >,
  locale: LocaleT,
): PagesByTagIdV => {
  const sitemap = localizedSitemapFromCacheOrBuildEff(ctx, locale);

  if (sitemap._tag === 'Right') {
    const pages = [...sitemap.right.sitemap.values()];

    const tagFilterF = (metadata: MetadataT, tagId: string) =>
      tagFilterPredicate(ctx.localeTagIdPrefix, locale.code, metadata)(tagId);

    const tagIdPageRefArr = pages.flatMap(
      page =>
        page?.metadata?.tags.flatMap(t =>
          page.metadata && tagFilterF(page.metadata, t.sys.id)
            ? [{ tagId: t.sys.id, sys: { id: page.sys.id } }]
            : [],
        ) || [],
    );

    const pagesGroupedByTagId: PagesByTagIdV = right(
      groupBy<{
        tagId: string;
        sys: { id: string };
      }>(({ tagId }) => tagId)(tagIdPageRefArr),
    );

    return pagesGroupedByTagId;
  } else {
    return sitemap;
  }
};

export const localizedPagesByTagIdFromCacheOrBuildEff = (
  ctx: Pick<
    ArboretumClientCtx,
    | 'options'
    | 'data'
    | 'pageHomeTagId'
    | 'sitemap'
    | 'localeTagIdPrefix'
    | 'pagesByTagId'
  >,
  locale: LocaleT,
): PagesByTagIdV => {
  const cachedLocalizedPagesByTagId = ctx.pagesByTagId.get(locale.code);
  const localizedPageByTagId = cachedLocalizedPagesByTagId
    ? cachedLocalizedPagesByTagId
    : buildLocalizedPagesByTagId(ctx, locale);
  ctx.pagesByTagId.set(locale.code, localizedPageByTagId);
  return localizedPageByTagId;
};
