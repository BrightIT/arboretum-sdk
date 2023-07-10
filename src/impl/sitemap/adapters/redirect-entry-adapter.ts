import { RedirectT } from "../../arboretum-client.impl";
import {
  ContentTypeT,
  EntryT,
  LocaleT,
} from "../../../clients/contentful-client/contentful-client";
import { SitemapDataT } from "../../data/sitemap-data";
import { localizeField } from "../helpers/localize-contentful-field";

export const redirectEntryAdapter = (
  data: Pick<SitemapDataT, "locales" | "defaultLocaleCode">,
  pageField: ContentTypeT["fields"][number],
  pathField: ContentTypeT["fields"][number],
  typeField: ContentTypeT["fields"][number],
  titleField: ContentTypeT["fields"][number] | undefined,
  parent: RedirectT["parent"],
  locale: LocaleT,
  entry: EntryT
): RedirectT | undefined => {
  const fieldValue = localizeField(data, locale);

  const page = fieldValue<{ sys?: { id?: string } }>(
    pageField.localized,
    entry.fields[pageField.id]
  );
  const path = fieldValue<string>(
    pathField.localized,
    entry.fields[pathField.id]
  );
  const type = fieldValue<string>(
    typeField.localized,
    entry.fields[typeField.id]
  );
  const title = titleField
    ? fieldValue<string>(titleField.localized, entry.fields[titleField.id])
    : undefined;
  const pageSysId = page?.sys?.id;

  return pageSysId && path && (type === "redirect" || type === "alias")
    ? {
        page: { sys: { id: pageSysId } },
        path: "/" + locale.code + path,
        title: title || undefined,
        metadata: entry.metadata,
        type,
        parent,
        sys: {
          id: entry.sys.id,
          cmaOnlyStatus: entry.sys.cmaOnlyStatus,
        },
      }
    : undefined;
};
