import { ArboretumClientCtx } from "../arboretum-client.impl";
import { EntryT } from "../../clients/contentful-client/contentful-client";

export const homePages = async (
  ctx: Pick<
    ArboretumClientCtx,
    "clientApi" | "localeTagIdPrefix" | "contentfulClientType"
  >,
  homePageTagId: string
): Promise<Array<EntryT>> => {
  const { items: homePages } = await ctx.clientApi.getEntries({
    ["metadata.tags.sys.id[in]"]: homePageTagId,
    include: 0,
    select:
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
      ctx.contentfulClientType === "cma-client"
        ? undefined
        : ["sys.id", "metadata"].join(","),
    order: "sys.createdAt",
  });

  return homePages;
};
