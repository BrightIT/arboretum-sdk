import { CreateClientParams } from "../../../../arboretum-client";
import {
  ContentfulClientT,
  GetLocalesResponseT,
} from "../../contentful-client";

import { contentfulFetch } from "./contentful-fetch";

export const getLocales =
  (config: CreateClientParams): ContentfulClientT["getLocales"] =>
  () =>
    contentfulFetch(config)<GetLocalesResponseT>("/locales", {}).then(
      (res) => ({
        total: res.total,
        skip: res.skip,
        limit: res.limit,
        items: res.items.map((i) => ({
          code: i.code,
          name: i.name,
          default: i.default,
          fallbackCode: i.fallbackCode,
        })),
      })
    );
