import {
  ArboretumClientConfigT,
  CreateClientParams,
} from "../../../arboretum-client";
import { ContentfulClientT } from "../contentful-client";
import { getLocales } from "./methods/get-locales";
import { getContentTypes } from "./methods/get-content-types";
import { getTags } from "./methods/get-tags";
import { getEntries } from "./methods/get-entries";

export const createContentfulClient = (
  config: ArboretumClientConfigT
): ContentfulClientT => {
  const configType = config.type;

  switch (config.type) {
    case "cda-client": {
      const c = config.contentful.client;
      const client = c.withAllLocales ? c.withAllLocales : c;
      return {
        getEntries: client.getEntries,
        getLocales: client.getLocales,
        getContentTypes: client.getContentTypes,
        getTags: client.getTags,
      };
    }
    case "cda-client-params": {
      const previewHostOrUndefined = config.preview
        ? "preview.contentful.com"
        : undefined;
      return createCdaRestApiContentfulClient({
        ...config.contentful,
        host: previewHostOrUndefined,
      });
    }
    case "cma-client": {
      const { client } = config.contentful;
      return {
        getEntries: (query) =>
          config.preview
            ? client.getEntries(query)
            : client.getPublishedEntries(query),
        getLocales: () => client.getLocales(),
        getContentTypes: (query) => client.getContentTypes(query),
        getTags: (query) => client.getTags(query),
      };
    }
    default: {
      const _: never = config;
      throw new Error(`Invalid config type ("${configType}").`);
    }
  }
};

export const createCdaRestApiContentfulClient = (
  config: CreateClientParams
): ContentfulClientT => ({
  getLocales: getLocales(config),
  getContentTypes: getContentTypes(config),
  getTags: getTags(config),
  getEntries: getEntries(config),
});
