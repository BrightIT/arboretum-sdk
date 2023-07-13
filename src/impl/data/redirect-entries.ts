import { ArboretumClientContentfulConfigOptionsT } from "../../arboretum-client";
import { ArboretumClientCtx } from "../arboretum-client.impl";
import {
  EntryIdT,
  EntryT,
  StatusT,
} from "../../clients/contentful-client/contentful-client";
import { entryStatus } from "./helpers/entry-status";
import { getAllEntriesRecursively } from "./helpers/get-all-entries-recursively";
import { arrayToMap } from "../../utils/array-to-map";

const getAllRedirectEntriesRecursively = async (
  ctx: Pick<ArboretumClientCtx, "clientApi" | "contentfulClientType">,
  redirectContentType: NonNullable<
    ArboretumClientContentfulConfigOptionsT["redirectContentType"]
  >,
  skip: number,
  acc: Array<EntryT>,
  select?: string
): Promise<Array<EntryT>> => {
  const fieldsSelect = [
    redirectContentType.titleFieldId,
    redirectContentType.pageFieldId,
    redirectContentType.typeFieldId,
    redirectContentType.pathFieldId,
  ].flatMap((id) => (id ? [`fields.${id}`] : []));

  return getAllEntriesRecursively(
    ctx.clientApi,
    redirectContentType.id,
    skip,
    acc,
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
    select || ctx.contentfulClientType === "cma-client"
      ? undefined
      : ["sys", "metadata", ...fieldsSelect].join(","),
    [redirectContentType.pageFieldId]
  );
};

export const cmaOnlyEntriesStatusRecord = async (
  ctx: Pick<
    ArboretumClientCtx,
    "clientApi" | "contentfulClientType" | "options"
  >
): Promise<Map<EntryIdT, StatusT | undefined>> => {
  const redirectEntries = ctx.options.redirectContentType
    ? await getAllRedirectEntriesRecursively(
        ctx,
        ctx.options.redirectContentType,
        0,
        []
      )
    : [];
  return arrayToMap<EntryT, StatusT | undefined>((e) => e.sys.id)((entry) =>
    entryStatus(entry.sys)
  )(redirectEntries);
};

export const redirectEntries = async (
  ctx: Pick<
    ArboretumClientCtx,
    | "clientApi"
    | "options"
    | "contentfulClientType"
    | "cmaPreviewClientApi"
    | "preview"
  >
): Promise<Array<EntryT>> => {
  const { cmaPreviewClientApi, options } = ctx;

  const redirectEntriesPromise = options.redirectContentType
    ? getAllRedirectEntriesRecursively(ctx, options.redirectContentType, 0, [])
    : Promise.resolve([]);

  /*
    This is woraround. Published entries from CMA (the same with CDA and CPA)
    don't have enough data to properly compute entry status
  */
  const statusRecordPromise =
    ctx.options.includeEntryStatus &&
    ctx.contentfulClientType === "cma-client" &&
    !ctx.preview &&
    cmaPreviewClientApi
      ? cmaOnlyEntriesStatusRecord({ ...ctx, clientApi: cmaPreviewClientApi })
      : Promise.resolve(new Map<EntryIdT, StatusT | undefined>());

  const [redirectEntries, cmaOnlyStatusRecord] = await Promise.all([
    redirectEntriesPromise,
    statusRecordPromise,
  ]);

  return redirectEntries.map((entry) => {
    const cmaOnlyStatus =
      ctx.contentfulClientType === "cma-client"
        ? entryStatus(entry.sys) || cmaOnlyStatusRecord.get(entry.sys.id)
        : undefined;
    if (cmaOnlyStatus) {
      entry.sys = { ...entry.sys, cmaOnlyStatus };
    }
    return entry;
  });
};
