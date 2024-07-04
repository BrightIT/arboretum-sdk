import { CreateClientParams } from "../../../../arboretum-client";
import {
  ContentfulClientT,
  GetContentTypesResponseT,
} from "../../contentful-client";

import { contentfulFetch } from "./contentful-fetch";

export const getContentTypes =
  (config: CreateClientParams): ContentfulClientT["getContentTypes"] =>
  (query) =>
    contentfulFetch(config)<GetContentTypesResponseT>(
      "/content_types",
      query || {}
    ).then((res) => ({
      total: res.total,
      skip: res.skip,
      limit: res.limit,
      items: res.items.map((i) => ({
        sys: { id: i.sys.id },
        fields: i.fields.map((f) => ({
          id: f.id,
          name: f.name,
          localized: f.localized,
          type: f.type,
          linkType: f.linkType,
          items: f.items
            ? { type: f.items.type, linkType: f.items.linkType }
            : undefined,
        })),
      })),
    }));
