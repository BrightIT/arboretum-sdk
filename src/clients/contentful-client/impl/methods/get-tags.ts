import { CreateClientParams } from "../../../../arboretum-client";
import { ContentfulClientT, GetTagsResponseT } from "../../contentful-client";

import { contentfulFetch } from "./contentful-fetch";

export const getTags =
  (config: CreateClientParams): ContentfulClientT["getTags"] =>
  (query) =>
    contentfulFetch(config)<GetTagsResponseT>("/tags", query || {}).then(
      (res) => ({
        total: res.total,
        skip: res.skip,
        limit: res.limit,
        items: res.items.map((i) => ({
          name: i.name,
          sys: {
            id: i.sys.id,
          },
        })),
      })
    );
