import { ArboretumClientContentfulConfigOptionsT } from "../../arboretum-client";
import { ArboretumClientCtx } from "../arboretum-client.impl";
import {
  EntryIdT,
  EntryT,
  StatusT,
} from "../../clients/contentful-client/contentful-client";
import { entryStatus } from "./helpers/entry-status";
import { getAllEntriesRecursively } from "./helpers/get-all-entries-recursively";
import { EntriesT } from "./sitemap-data";
import { arrayToMap } from "../../utils/array-to-map";

const getAllPageEntriesRecursively = async (
  { getEntries }: Pick<ArboretumClientCtx["clientApi"], "getEntries">,
  contentfulClientType: ArboretumClientCtx["contentfulClientType"],
  pageContentTypeOpt: ArboretumClientContentfulConfigOptionsT["pageContentTypes"][string] & {
    id: string;
  },
  skip: number,
  acc: Array<EntryT>,
  select?: string
): Promise<Array<EntryT>> => {
  return getAllEntriesRecursively(
    { getEntries },
    contentfulClientType,
    pageContentTypeOpt.id,
    skip,
    acc,
    select,
    pageContentTypeOpt.childPagesFieldId
      ? [pageContentTypeOpt.childPagesFieldId]
      : []
  );
};

const cmaOnlyEntriesStatusMap = async (
  { getEntries }: Pick<ArboretumClientCtx["clientApi"], "getEntries">,
  contentfulClientType: ArboretumClientCtx["contentfulClientType"],
  options: ArboretumClientCtx["options"]
): Promise<Map<EntryIdT, StatusT | undefined>> => {
  const pageContentTypes = Object.entries(options.pageContentTypes);
  const pageEntries = await Promise.all(
    pageContentTypes.map(([id, fieldIds]) =>
      getAllPageEntriesRecursively(
        { getEntries },
        contentfulClientType,
        { id, ...fieldIds },
        0,
        [],
        "sys"
      )
    )
  );

  return arrayToMap<EntryT, StatusT | undefined>((e) => e.sys.id)((entry) =>
    entryStatus(entry.sys)
  )(pageEntries.flat());
};

export const pageEntries = async (
  ctx: Pick<
    ArboretumClientCtx,
    "options" | "contentfulClientType" | "preview" | "pageHomeTagId"
  >,
  apiClient: Pick<ArboretumClientCtx["clientApi"], "getEntries">,
  cmaPreviewClientApi?: Pick<
    NonNullable<ArboretumClientCtx["cmaPreviewClientApi"]>,
    "getEntries"
  >
): Promise<{ allPages: EntriesT; homePages: Array<EntryT> }> => {
  const { options } = ctx;
  const pageContentTypes = Object.entries(options.pageContentTypes);

  const pageEntriesPromise = Promise.all(
    pageContentTypes.map(([id, fieldIds]) => {
      const fieldsSelect = [
        fieldIds.slugFieldId,
        fieldIds.childPagesFieldId,
        fieldIds.titleFieldId,
        fieldIds.parentPageFieldId,
        ...(fieldIds.select || []),
      ].flatMap((id) => (id ? [`fields.${id}`] : []));

      const select = ["sys", "metadata", ...fieldsSelect].join(",");

      return getAllPageEntriesRecursively(
        apiClient,
        ctx.contentfulClientType,
        { id, ...fieldIds },
        0,
        [],
        select
      );
    })
  );
  /*
    This is woraround. Published entries from CMA (the same with CDA and CPA)
    don't have enough data to properly compute entry status
  */
  const statusRecordPromise =
    ctx.options.includeEntryStatus &&
    ctx.contentfulClientType === "cma-client" &&
    !ctx.preview &&
    cmaPreviewClientApi
      ? cmaOnlyEntriesStatusMap(
          cmaPreviewClientApi,
          ctx.contentfulClientType,
          ctx.options
        )
      : Promise.resolve(new Map<EntryIdT, StatusT | undefined>());

  const [pageEntries, cmaOnlyStatusRecord] = await Promise.all([
    pageEntriesPromise,
    statusRecordPromise,
  ]);

  let homePages: Array<EntryT> = [];

  const allPages = new Map(
    pageEntries.flat().map((entry) => {
      if (
        entry.metadata?.tags.find((t) => t.sys.id.startsWith(ctx.pageHomeTagId))
      ) {
        homePages.push(entry);
      }
      const cmaOnlyStatus =
        ctx.contentfulClientType === "cma-client"
          ? entryStatus(entry.sys) || cmaOnlyStatusRecord.get(entry.sys.id)
          : undefined;
      if (cmaOnlyStatus) {
        entry.sys = { ...entry.sys, cmaOnlyStatus };
      }
      return [entry.sys.id, entry];
    })
  );

  return { allPages, homePages };
};
