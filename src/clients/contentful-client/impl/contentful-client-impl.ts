import {
  ArboretumClientConfigT,
  CreateClientParams,
} from "../../../arboretum-client";
import { ContentfulClientT } from "../contentful-client";
import { getContentTypes } from "./methods/get-content-types";
import { getEntries } from "./methods/get-entries";
import { getLocales } from "./methods/get-locales";
import { getTags } from "./methods/get-tags";

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
      const PREVIEW_HOST: string = config.hosts?.preview ?? "preview.contentful.com";
      const PUBLISHED_HOST: string = config.hosts?.published ?? "cdn.contentful.com";

      const host = config.preview ? PREVIEW_HOST : PUBLISHED_HOST
  
      return createCdaRestApiContentfulClient({
        ...config.contentful,
        host: host,
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
