import { CreateClientParams } from "../../../../arboretum-client";
import {
  ContentfulClientT,
  GetEntriesResponseT,
} from "../../contentful-client";

import { contentfulFetch } from "./contentful-fetch";

export const getEntries =
  (config: CreateClientParams): ContentfulClientT["getEntries"] =>
  (query) =>
    contentfulFetch(config)<GetEntriesResponseT>("/entries", query || {}).then(
      (res) => ({
        total: res.total,
        skip: res.skip,
        limit: res.limit,
        items: res.items?.map((i) => ({
          metadata: i.metadata
            ? { tags: i.metadata.tags.map((t) => ({ sys: { id: t.sys.id } })) }
            : undefined,
          fields: i.fields,
          sys: {
            id: i.sys.id,
            archivedVersion: i.sys.archivedVersion,
            version: i.sys.version,
            publishedVersion: i.sys.publishedVersion,
            contentType: { sys: { id: i.sys.contentType?.sys?.id } },
            cmaOnlyStatus: undefined,
          },
        })),
      })
    );
