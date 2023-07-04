import { EntryT } from '../../../clients/contentful-client/contentful-client';
import { parseLocaleTag } from './parse-locale-tag';

export const localeCodesFromMetadata = (
  localeTagIdPrefix: string,
  metadata: EntryT['metadata'],
): Array<string> =>
  metadata?.tags.flatMap(t => {
    const maybeLocaleCode = parseLocaleTag(localeTagIdPrefix)(t.sys.id);
    return maybeLocaleCode ? [maybeLocaleCode.localeCode] : [];
  }) || [];
