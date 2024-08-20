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
  contentfulClientType: ArboretumClientCtx["contentfulClientType"],
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
    /* For some reason select param causes errors in CMA. I'm getting the following response: 
  {
    "status": 400,
    "statusText": "Bad Request",
    "message": "The query you sent was invalid. Probably a filter or ordering specification is not applicable to the type of a field.",
    "details": {
      "errors": [
        {
          "name": "select",
          "details": "Select is only applicable when querying a collection of entities."
        }
      ]
    },
    "request": {
      "url": "/spaces/8h4rcnu50txt/environments/dacjan-test/public/entries",
      "method": "get",
      ...
    },
}*/
    select: contentfulClientType !== "cma-client" ? select : undefined,
    locale:
      contentfulClientType === "cda-client-with-all-locales" ? undefined : "*",
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
        contentfulClientType,
        contentType,
        skip + limit,
        acc,
        select
      )
    : acc;
};
