import { PageT } from "../../arboretum-client.impl";
import {
  ContentTypeT,
  EntryT,
  LocaleT,
} from "../../../clients/contentful-client/contentful-client";
import { SitemapDataT } from "../../data/sitemap-data";
import { localizeField } from "../helpers/localize-contentful-field";

export const pageEntryAdapter = (
  data: Pick<SitemapDataT, "locales" | "defaultLocaleCode" | "pages">,
  slugField: ContentTypeT["fields"][number],
  titleField: ContentTypeT["fields"][number] | undefined,
  childrenRefs: PageT["childPages"],
  locale: LocaleT,
  parent: (NonNullable<PageT["parent"]> & { path: string }) | undefined,
  entry: EntryT
): PageT | undefined => {
  const fieldValue = localizeField(data, locale);

  const slug = fieldValue<string>(
    slugField.localized,
    entry.fields[slugField.id]
  )?.toLowerCase();

  const title = titleField
    ? fieldValue<string>(titleField.localized, entry.fields[titleField.id])
    : undefined;

  return slug
    ? {
        type: "page",
        parent: parent ? { sys: parent.sys } : undefined,
        path: parent ? parent.path + "/" + slug : "/" + locale.code,
        slug,
        title: title || undefined,
        sys: {
          id: entry.sys.id,
          cmaOnlyStatus: entry.sys.cmaOnlyStatus,
          contentTypeId: entry.sys.contentType.sys.id,
        },
        metadata: entry.metadata,
        childPages:
          childrenRefs?.flatMap((childPage) =>
            childPage?.sys?.id ? [{ sys: { id: childPage?.sys.id } }] : []
          ) || [],
      }
    : undefined;
};
