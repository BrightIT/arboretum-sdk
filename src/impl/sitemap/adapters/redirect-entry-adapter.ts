import { ArboretumClientCtx, PageT, RedirectT } from "../../arboretum-client.impl";
import {
  ContentTypeT,
  EntryT,
  LocaleT,
} from "../../../clients/contentful-client/contentful-client";
import { SitemapDataT } from "../../data/sitemap-data";
import { localizeField } from "../helpers/localize-contentful-field";

export const redirectEntryAdapter = (
  data: Pick<SitemapDataT, "locales" | "defaultLocaleCode" | "contentTypes">,
  options: NonNullable<ArboretumClientCtx["options"]["redirectContentType"]>,
  pageField: ContentTypeT["fields"][number],
  pathField: ContentTypeT["fields"][number],
  typeField: ContentTypeT["fields"][number],
  titleField: ContentTypeT["fields"][number] | undefined,
  parent: Pick<PageT, "sys" | "path">,
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
  )?.toLowerCase();
  const type = fieldValue<string>(
    typeField.localized,
    entry.fields[typeField.id]
  );
  const title = titleField
    ? fieldValue<string>(titleField.localized, entry.fields[titleField.id])
    : undefined;
  const pageSysId = page?.sys?.id;

  const contentTypeId = entry.sys.contentType.sys.id;

  /* Only set when "select" is configured so that redirects built from configs
     without it keep their previous shape */
  const additionalFields = options.select
    ? options.select.reduce((acc, fieldId) => {
        const contentType = data.contentTypes.get(contentTypeId);
        if (contentType) {
          const field = contentType.fields.get(fieldId);
          const value = field
            ? fieldValue(field.localized, entry.fields[field.id])
            : undefined;
          acc[fieldId] = value;
        }

        return acc;
      }, {} as { [key: string]: any })
    : undefined;

  return pageSysId && path && (type === "redirect" || type === "alias")
    ? {
        page: { sys: { id: pageSysId } },
        path: parent.path + (path.startsWith("/") ? path : `/${path}`),
        title: title || undefined,
        metadata: entry.metadata,
        type,
        parent: { sys: { id: parent.sys.id } },
        sys: {
          id: entry.sys.id,
          cmaOnlyStatus: entry.sys.cmaOnlyStatus,
          contentTypeId,
        },
        additionalFields,
      }
    : undefined;
};
