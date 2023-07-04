import { EntryT } from '../../../clients/contentful-client/contentful-client';
import {
  ArboretumClientCtx,
  LocaleCodeT,
  SysIdT,
  TagIdT,
} from '../../arboretum-client.impl';
import { LocalesT } from '../locales';
import { localeCodesFromMetadata } from './locale-codes-from-metadata';

export type HomePagesByTagIdT = {
  homePagesByTagId: Map<
    LocaleCodeT,
    Map<TagIdT, Array<{ sys: { id: SysIdT } }>>
  >;
  warnings?: Array<string>;
};

export const homePagesByTagId = (
  ctx: Pick<ArboretumClientCtx, 'localeTagIdPrefix' | 'pageHomeTagId'>,
  locales: LocalesT,
  entries: Array<{
    metadata?: EntryT['metadata'];
    sys: Pick<EntryT['sys'], 'id'>;
  }>,
): HomePagesByTagIdT => {
  const seed: HomePagesByTagIdT = { homePagesByTagId: new Map() };
  return entries
    .filter(
      entry => !!entry.metadata?.tags.find(t => t.sys.id === ctx.pageHomeTagId),
    )
    .reduce((acc, entry) => {
      const entryRef = { sys: { id: entry.sys.id } };
      /* 
        Currently we don't support contentful locales fallback mechanism in tags.
        It means that if you want to customize home pages per locale you should add
        locale tag for every locale
      */
      const tagBasedLocaleCodes = localeCodesFromMetadata(
        ctx.localeTagIdPrefix,
        entry.metadata,
      ).filter(code => !!locales.locales.get(code));

      const localeCodes =
        tagBasedLocaleCodes.length > 0
          ? tagBasedLocaleCodes
          : [...locales.locales.keys()];

      localeCodes.forEach(localeCode => {
        const localizedPagesByTagId = acc.homePagesByTagId.get(localeCode);
        if (localizedPagesByTagId) {
          const localizedPages = localizedPagesByTagId.get(ctx.pageHomeTagId);
          if (localizedPages) {
            const warning = `More than one page is tagged as home page (tagLocaleCode: ${localeCode}, entryId: ${entry.sys.id})`;
            localizedPages.push(entryRef);
            localizedPagesByTagId.set(ctx.pageHomeTagId, localizedPages);
            if (acc.warnings) acc.warnings.push(warning);
            else {
              acc.warnings = [warning];
            }
          } else {
            localizedPagesByTagId.set(ctx.pageHomeTagId, [entryRef]);
          }
        } else {
          acc.homePagesByTagId.set(
            localeCode,
            new Map([[ctx.pageHomeTagId, [entryRef]]]),
          );
        }
      });
      return acc;
    }, seed);
};
