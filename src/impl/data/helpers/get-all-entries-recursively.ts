import { EntryT } from "../../../clients/contentful-client/contentful-client";
import { ArboretumClientCtx, SysIdT } from "../../arboretum-client.impl";

export type PagesT = { [sys: SysIdT]: EntryT };

/* 
  Even if you define flag "include: 0" in contentful client the references (at least some of them) are resolved.
  This results in a large amount of data being stored in memory unnecessarily.
  The purpose of this function is to filter out all redundant data and keep the references (sys field) only.
*/
const filterOutNestedEntriesFieldsOtherThanSysEff =
  (entry: EntryT) =>
  (field: string): EntryT => {
    Object.keys(entry.fields[field] || {}).forEach((localeCode) => {
      let nestedEntry = entry.fields[field][localeCode];
      if (Array.isArray(nestedEntry)) {
        nestedEntry.forEach((e, idx) => {
          nestedEntry[idx] = { sys: e?.sys };
        });
      } else {
        nestedEntry = { sys: nestedEntry?.sys };
      }
    });
    return entry;
  };

export const getAllEntriesRecursively = async (
  { getEntries }: Pick<ArboretumClientCtx["clientApi"], "getEntries">,
  contentType: string,
  skip: number,
  acc: Array<EntryT>,
  select?: string,
  refFieldsToFilterOut: Array<string> = [],
  limit: number = 1000
): Promise<Array<EntryT>> => {
  const { items } = await getEntries({
    limit,
    skip,
    content_type: contentType,
    include: 0,
    select,
    locale: "*",
  });

  items.forEach((i) => {
    refFieldsToFilterOut.forEach((field) => {
      filterOutNestedEntriesFieldsOtherThanSysEff(i)(field);
    });
  });

  acc.push(...items);
  return items.length >= limit
    ? getAllEntriesRecursively(
        { getEntries },
        contentType,
        skip + limit,
        acc,
        select
      )
    : acc;
};
